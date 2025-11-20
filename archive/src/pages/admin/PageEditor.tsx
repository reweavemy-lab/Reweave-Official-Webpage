import { useState, useEffect } from 'react'
import { AlertCircle, Save, RotateCcw, Eye, Download } from 'lucide-react'

interface PageContent {
  content: string
  lastModified: string
  backup?: string
}

export default function PageEditor() {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current page content
  useEffect(() => {
    fetchPageContent()
  }, [])

  // Check for changes
  useEffect(() => {
    setHasChanges(content !== originalContent)
  }, [content, originalContent])

  const fetchPageContent = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/page-content', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch page content')
      }

      const data = await response.json()
      setContent(data.content)
      setOriginalContent(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Validate content
      if (!content.trim()) {
        throw new Error('Content cannot be empty')
      }

      // Basic HTML validation
      if (!content.includes('<!DOCTYPE html>') || !content.includes('<html')) {
        throw new Error('Content must be valid HTML')
      }

      const response = await fetch('/api/admin/page-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          content,
          createBackup: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save content')
      }

      const data = await response.json()
      setOriginalContent(content)
      setSuccess('Page content saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (hasChanges && !confirm('Are you sure you want to discard your changes?')) {
      return
    }
    setContent(originalContent)
  }

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch('/api/admin/page-content/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch backup')
      }

      const data = await response.json()
      const blob = new Blob([data.content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `onepage-backup-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download backup')
    }
  }

  const openPreview = () => {
    const previewWindow = window.open('', '_blank', 'width=1200,height=800')
    if (previewWindow) {
      previewWindow.document.write(content)
      previewWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-indigo mb-2">Page Editor</h1>
        <p className="text-pebble">Edit the onepage.html content for your website</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <div className="w-5 h-5 text-green-500 mr-3">✓</div>
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white rounded-lg shadow-soft p-4">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              saving || !hasChanges
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-sage text-white hover:bg-sage/90'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              !hasChanges
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={openPreview}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-indigo text-white hover:bg-indigo/90 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gold text-white hover:bg-gold/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Backup
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {hasChanges && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ You have unsaved changes. Don't forget to save your work!
          </p>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">HTML Content Editor</h2>
          <p className="text-sm text-gray-600 mt-1">
            Editing: onepage.html
          </p>
        </div>
        
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage resize-none"
            placeholder="Enter your HTML content here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Editor Guidelines</h3>
        <ul className="text-blue-800 space-y-2 text-sm">
          <li>• Make sure your HTML includes proper &lt;!DOCTYPE html&gt; declaration</li>
          <li>• Test your changes using the Preview button before saving</li>
          <li>• A backup will be automatically created when you save</li>
          <li>• You can download previous backups using the Download Backup button</li>
          <li>• Changes will take effect immediately after saving</li>
        </ul>
      </div>
    </div>
  )
}