# Reweave Batik Luxe Design System

## 🎨 Visual Identity

### Brand Essence
**"Where Culture Moves"** - A luxurious, cultural, and modern approach to sustainable fashion that connects heritage, community, and environmental responsibility.

### Design Philosophy
- **Quiet Luxury**: Sophisticated, understated elegance
- **Cultural Heritage**: Respectful celebration of traditional craftsmanship
- **Modern Minimalism**: Clean, purposeful design with breathing room
- **Sustainable Aesthetics**: Earth tones and natural materials

## 🎨 Color Palette

### Primary Colors
```css
/* Deep Indigo - Main brand color */
--color-indigo: #1A2741;
/* Warm Sand - Soft background */
--color-sand: #E5D6BF;
/* Muted Sage - Sustainability accent */
--color-sage: #9BA48C;
/* Charcoal Brown - Text and structure */
--color-brown: #3A2E27;
```

### Secondary Accents
```css
/* Burnished Gold - Craftsmanship */
--color-gold: #C4A96A;
/* Terracotta Umber - Cultural warmth */
--color-terracotta: #8C4B36;
```

### Supporting Neutrals
```css
/* Ivory Mist - Light sections */
--color-ivory: #FAF7F2;
/* Pebble Gray - Secondary text */
--color-pebble: #B1ABA2;
/* Midnight Navy - Footer and overlays */
--color-navy: #0E1824;
/* Text Color */
--color-text: #2E2B28;
```

## 📝 Typography

### Font Families
- **Display Font**: Playfair Display (serif) - for headings and luxury feel
- **Body Font**: Inter (sans-serif) - for readability and modern appeal

### Type Scale
```css
/* Headings */
h1: 4rem (64px) - Hero titles
h2: 3rem (48px) - Section titles
h3: 2rem (32px) - Subsection titles
h4: 1.5rem (24px) - Card titles

/* Body Text */
body: 1rem (16px) - Main content
small: 0.875rem (14px) - Captions and metadata
```

### Font Weights
- **Light**: 300 - Elegant, refined
- **Regular**: 400 - Body text
- **Medium**: 500 - Navigation and buttons
- **Semibold**: 600 - Headings
- **Bold**: 700 - Hero text and emphasis

## 🎯 Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--color-sage);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-terracotta);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: var(--color-gold);
  color: var(--color-brown);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}
```

#### Outline Button
```css
.btn-outline {
  border: 2px solid var(--color-indigo);
  color: var(--color-indigo);
  background: transparent;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}
```

### Cards

#### Standard Card
```css
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
```

#### Luxury Card
```css
.card-luxury {
  background: linear-gradient(135deg, var(--color-ivory) 0%, var(--color-sand) 100%);
  border: 1px solid rgba(155, 164, 140, 0.2);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}
```

### Navigation

#### Header
```css
header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  position: fixed;
  width: 100%;
  z-index: 1000;
}
```

#### Navigation Links
```css
.nav-link {
  color: var(--color-indigo);
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--color-terracotta);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-accent);
  transition: width 0.3s ease;
}
```

## 🎨 Layout System

### Grid System
```css
.container-custom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Responsive Grid */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
```

### Spacing Scale
```css
/* Spacing Variables */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### Section Padding
```css
.section-padding {
  padding: 4rem 0;
}

@media (min-width: 1024px) {
  .section-padding {
    padding: 6rem 0;
  }
}
```

## 🎭 Animations

### Transitions
```css
/* Standard Transition */
.transition-standard {
  transition: all 0.3s ease-in-out;
}

/* Fast Transition */
.transition-fast {
  transition: all 0.2s ease-in-out;
}

/* Slow Transition */
.transition-slow {
  transition: all 0.5s ease-in-out;
}
```

### Keyframe Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(30px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* Small devices (landscape phones) */
@media (min-width: 640px) { /* sm */ }

/* Medium devices (tablets) */
@media (min-width: 768px) { /* md */ }

/* Large devices (desktops) */
@media (min-width: 1024px) { /* lg */ }

/* Extra large devices */
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Navigation
```css
@media (max-width: 768px) {
  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    flex-direction: column;
    padding: 20px;
  }
}
```

## 🎨 Visual Elements

### Shadows
```css
/* Soft Shadow */
.shadow-soft {
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

/* Medium Shadow */
.shadow-medium {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* Strong Shadow */
.shadow-strong {
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}
```

### Border Radius
```css
/* Standard Radius */
.rounded-xl { border-radius: 1rem; }
.rounded-2xl { border-radius: 1.5rem; }
.rounded-3xl { border-radius: 2rem; }
```

### Gradients
```css
/* Hero Gradient */
.hero-gradient {
  background: linear-gradient(135deg, var(--color-indigo) 0%, var(--color-navy) 100%);
}

/* Card Gradient */
.card-gradient {
  background: linear-gradient(135deg, var(--color-ivory) 0%, var(--color-sand) 100%);
}
```

## 🎯 Usage Guidelines

### Color Usage
- **Indigo**: Primary brand color, use for headings and CTAs
- **Sand**: Backgrounds and neutral areas
- **Sage**: Buttons and interactive elements
- **Gold**: Accents and highlights
- **Terracotta**: Hover states and cultural elements

### Typography Hierarchy
1. **Hero Text**: Playfair Display, 4rem, Bold
2. **Section Headings**: Playfair Display, 3rem, Semibold
3. **Card Titles**: Playfair Display, 1.5rem, Semibold
4. **Body Text**: Inter, 1rem, Regular
5. **Captions**: Inter, 0.875rem, Medium

### Spacing Rules
- Use consistent spacing scale
- Maintain visual rhythm
- Group related elements
- Create breathing room

### Animation Principles
- Subtle and purposeful
- 200-300ms duration
- Ease-in-out timing
- Respect user preferences

## 🎨 Brand Applications

### Logo Usage
- Minimum size: 24px height
- Clear space: 2x logo height
- Never distort or modify
- Use on light backgrounds when possible

### Photography Style
- Natural, diffused lighting
- Raw materials and textures
- Human hands and craftsmanship
- Indigo, sand, sage color palette
- Minimal composition with negative space

### Material Translation
- **Exterior**: Deep indigo canvas/upcycled denim
- **Lining**: Gold-thread batik pattern
- **Hardware**: Brushed brass or matte gunmetal
- **Packaging**: Warm sand box with debossed logo
- **Hang Tags**: Kraft paper with sage stitching

---

*This design system ensures consistency, accessibility, and luxury across all Reweave touchpoints while celebrating cultural heritage and sustainable practices.*
