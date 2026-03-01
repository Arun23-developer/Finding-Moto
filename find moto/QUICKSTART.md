# Quick Start Guide

## Installation Steps

### 1. Prerequisites
Ensure you have Node.js (v16 or higher) and npm installed on your system.

```bash
node --version
npm --version
```

### 2. Install Dependencies
Navigate to the project directory and install all dependencies:

```bash
cd "c:\Users\ACER\Desktop\find moto"
npm install
```

### 3. Start Development Server
Launch the development server with hot module replacement:

```bash
npm run dev
```

The application will automatically open at `http://localhost:3000`

### 4. Build for Production
Create an optimized production build:

```bash
npm run build
npm run preview
```

## Project Overview

This is a full-featured Admin Dashboard for an AI-powered Automobile Marketplace with:

- **Modern UI**: Clean, professional interface with gradients and animations
- **Responsive Design**: Works perfectly on all devices (mobile, tablet, desktop)
- **Real-time Charts**: Interactive sales and order visualizations
- **Multi-page Application**: Dashboard, Users, Products, Orders, and Reports pages
- **Component-based**: Modular, reusable React components
- **Type-safe**: Full TypeScript support

## Navigation

### Dashboard (`/`)
Main overview page with:
- Key metrics summary cards
- Monthly sales and orders chart
- Top selling models
- Recent activity feed

### Users (`/users`)
User management page with:
- User list in table format
- Email, phone, and status information
- Join date tracking
- CRUD action buttons

### Products (`/products`)
Product inventory page with:
- Car models and specifications
- Pricing information
- Stock availability
- Customer ratings
- Category classification

### Orders (`/orders`)
Order tracking page with:
- Order identification and tracking
- Customer and product information
- Order amounts and dates
- Order status tracking
- Delivery management

### Reports (`/reports`)
Analytics and insights page with:
- Monthly performance report
- Bar chart visualization
- Key business metrics
- Regional and category insights
- Customer satisfaction scores

## Key Components

### Sidebar Navigation
- Active route highlighting
- Icon-based menu items
- Smooth transitions
- Mobile-responsive collapse

### Top Navbar
- User profile section
- Notification badge
- Settings and logout options
- Responsive design

### Summary Cards
- Color-coded metrics
- Performance indicators
- Change percentage display
- Hover animations

### Sales Chart
- Line and bar chart options
- Monthly data visualization
- Multiple datasets support
- Responsive sizing

### Data Tables
- Sortable columns
- Status badges
- Action buttons
- Pagination controls
- Search functionality

## Customization Tips

### Changing Colors
Edit the color values in the respective CSS files:
- Global colors: `src/index.css`
- Component colors: `src/styles/*.css`

### Adding New Pages
1. Create a new component in `src/pages/`
2. Import it in `App.tsx`
3. Add a new Route
4. Add menu item to Sidebar.tsx

### Modifying Data
Update mock data in `src/utils/constants.ts` or integrate with your backend API.

### Styling Adjustments
Each component has its own CSS file in `src/styles/` for easy customization.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Dependencies Overview

### UI & Styling
- **Bootstrap 5.3.0**: CSS framework for responsive design
- **React Icons 4.12.0**: Beautiful icon library

### Routing & State
- **React Router DOM 6.20.0**: Client-side routing
- **React 18.2.0**: Core library

### Data Visualization
- **Chart.js 4.4.1**: Charts and graphs
- **React ChartJS 2 5.2.0**: React wrapper

### Build & Development
- **Vite 5.0.0**: Fast build tool
- **TypeScript 5.3.0**: Type safety

## Project Structure Quick Reference

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components for routing
├── styles/           # CSS files
├── utils/            # Constants, types, hooks
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Common Tasks

### Add New Navigation Item
Edit `src/components/Sidebar.tsx`:
```tsx
<Link to="/new-page" className={`nav-item ${isActive('/new-page') ? 'active' : ''}`}>
  <FiIcon className="icon" />
  <span>New Page</span>
</Link>
```

### Create New Page
Create `src/pages/NewPage.tsx`:
```tsx
import '../styles/Pages.css'

function NewPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>New Page</h1>
      </div>
      {/* Page content */}
    </div>
  )
}

export default NewPage
```

### Integrate API
Replace mock data in components with API calls:
```tsx
import { useFetch } from '../utils/hooks'

const { data, loading, error } = useFetch('/api/endpoint')
```

## Deployment

### Build Checklist
- [ ] Update product/company information
- [ ] Replace mock data with real API endpoints
- [ ] Update authentication mechanism
- [ ] Set up environment variables
- [ ] Test on multiple browsers
- [ ] Optimize images and assets
- [ ] Enable HTTPS
- [ ] Configure CORS properly

### Deploy to Popular Platforms

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

#### Traditional Server
```bash
npm run build
# Copy dist folder to server
```

## Troubleshooting

### Port Already in Use
Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001  // Change to available port
}
```

### Dependencies Issues
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### TypeScript Errors
Ensure TypeScript is properly installed:
```bash
npm install --save-dev typescript
```

## Performance Tips

1. Use React DevTools for profiling
2. Implement code splitting for pages
3. Optimize images and assets
4. Use memoization for expensive components
5. Implement lazy loading for routes

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Getting Help

- Check the README.md for detailed documentation
- Review PROJECT_STRUCTURE.md for architecture details
- Examine component source code for examples
- Create custom hooks in utils/hooks.ts as needed

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Explore the dashboard
4. Customize components as needed
5. Integrate with your backend API
6. Deploy to production

---

**Happy coding!** 🚀
