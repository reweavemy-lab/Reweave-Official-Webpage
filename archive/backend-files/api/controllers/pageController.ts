import { Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'

const PAGE_FILE_PATH = path.join(process.cwd(), 'onepage.html')
const BACKUP_DIR = path.join(process.cwd(), 'backups')

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR)
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

// Get current page content
export const getPageContent = async (req: Request, res: Response) => {
  try {
    // Check if file exists
    try {
      await fs.access(PAGE_FILE_PATH)
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Page file not found'
      })
    }

    const content = await fs.readFile(PAGE_FILE_PATH, 'utf-8')
    const stats = await fs.stat(PAGE_FILE_PATH)
    
    res.json({
      success: true,
      data: {
        content,
        lastModified: stats.mtime.toISOString(),
        fileSize: stats.size
      }
    })
  } catch (error) {
    console.error('Error reading page content:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to read page content'
    })
  }
}

// Update page content
export const updatePageContent = async (req: Request, res: Response) => {
  try {
    const { content, createBackup = true } = req.body

    // Validate input
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a string'
      })
    }

    // Basic HTML validation
    const trimmedContent = content.trim()
    if (!trimmedContent.includes('<!DOCTYPE html>') || !trimmedContent.includes('<html')) {
      return res.status(400).json({
        success: false,
        message: 'Content must be valid HTML with DOCTYPE and html tags'
      })
    }

    // Create backup if requested
    if (createBackup) {
      try {
        await ensureBackupDir()
        const backupFileName = `onepage-backup-${Date.now()}.html`
        const backupPath = path.join(BACKUP_DIR, backupFileName)
        
        // Copy current content to backup
        await fs.copyFile(PAGE_FILE_PATH, backupPath)
      } catch (backupError) {
        console.error('Error creating backup:', backupError)
        // Continue with update even if backup fails
      }
    }

    // Write new content
    await fs.writeFile(PAGE_FILE_PATH, content, 'utf-8')
    
    // Get file stats after update
    const stats = await fs.stat(PAGE_FILE_PATH)

    res.json({
      success: true,
      message: 'Page content updated successfully',
      data: {
        lastModified: stats.mtime.toISOString(),
        fileSize: stats.size
      }
    })
  } catch (error) {
    console.error('Error updating page content:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update page content'
    })
  }
}

// Get latest backup
export const getLatestBackup = async (req: Request, res: Response) => {
  try {
    await ensureBackupDir()
    
    const files = await fs.readdir(BACKUP_DIR)
    const backupFiles = files.filter(file => file.startsWith('onepage-backup-') && file.endsWith('.html'))
    
    if (backupFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No backups found'
      })
    }

    // Sort by timestamp (newest first)
    backupFiles.sort((a, b) => {
      const timeA = parseInt(a.match(/onepage-backup-(\d+)\.html/)?.[1] || '0')
      const timeB = parseInt(b.match(/onepage-backup-(\d+)\.html/)?.[1] || '0')
      return timeB - timeA
    })

    const latestBackup = backupFiles[0]
    const backupPath = path.join(BACKUP_DIR, latestBackup)
    const content = await fs.readFile(backupPath, 'utf-8')
    const stats = await fs.stat(backupPath)

    res.json({
      success: true,
      data: {
        content,
        backupName: latestBackup,
        createdAt: stats.mtime.toISOString()
      }
    })
  } catch (error) {
    console.error('Error getting backup:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get backup'
    })
  }
}

// List all backups
export const listBackups = async (req: Request, res: Response) => {
  try {
    await ensureBackupDir()
    
    const files = await fs.readdir(BACKUP_DIR)
    const backupFiles = files.filter(file => file.startsWith('onepage-backup-') && file.endsWith('.html'))
    
    const backups = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = await fs.stat(filePath)
        return {
          name: file,
          createdAt: stats.mtime.toISOString(),
          size: stats.size
        }
      })
    )

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json({
      success: true,
      data: {
        backups,
        total: backups.length
      }
    })
  } catch (error) {
    console.error('Error listing backups:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to list backups'
    })
  }
}