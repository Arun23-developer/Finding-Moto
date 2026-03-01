# AI Powered Automobile Marketplace - Admin Dashboard

A responsive, professionally designed Admin Dashboard built with React, TypeScript, Bootstrap, and Chart.js for managing an AI-powered automobile marketplace.

## 🚀 Features

- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with gradient backgrounds and smooth animations
- **Sidebar Navigation**: Easy-to-navigate sidebar with active route highlighting
- **Top Navbar**: User profile section with notifications and quick actions
- **Dashboard Summary**: Key metrics cards showing revenue, users, orders, and growth rate
- **Interactive Charts**: Chart.js integration for visualizing monthly sales and order trends
- **Multiple Pages**:
  - **Dashboard**: Overview with summary cards and charts
  - **Users**: User management with CRUD operations
  - **Products**: Product inventory management
  - **Orders**: Order tracking and management
  - **Reports**: Analytics and insights with detailed reporting
- **Component-Based Architecture**: Reusable, maintainable component structure
- **Bootstrap Integration**: Professional styling with Bootstrap 5

## 📁 Project Structure

```
find-moto/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Main layout with sidebar and navbar
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── SummaryCard.tsx     # Summary metrics card
│   │   └── SalesChart.tsx      # Monthly sales chart
│   ├── pages/
│   │   ├── Dashboard.tsx       # Dashboard page
│   │   ├── Users.tsx           # Users management page
│   │   ├── Products.tsx        # Products management page
│   │   ├── Orders.tsx          # Orders management page
│   │   └── Reports.tsx         # Reports and analytics page
│   ├── styles/
│   │   ├── Layout.css          # Layout styles
│   │   ├── Sidebar.css         # Sidebar styles
│   │   ├── Navbar.css          # Navbar styles
│   │   ├── SummaryCard.css     # Summary card styles
│   │   ├── Dashboard.css       # Dashboard styles
│   │   └── Pages.css           # Pages styles
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript node configuration
├── vite.config.ts              # Vite configuration
└── README.md                   # Project documentation
```

## 🛠️ Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd find-moto
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will automatically open in your default browser at `http://localhost:3000`

## 📦 Dependencies

### Core Dependencies
- **React 18.2.0** - UI library
- **React DOM 18.2.0** - DOM rendering
- **React Router DOM 6.20.0** - Client-side routing
- **TypeScript 5.3.0** - Type safety

### UI & Styling
- **Bootstrap 5.3.0** - CSS framework
- **React Icons 4.12.0** - Icon library

### Charts & Visualization
- **Chart.js 4.4.1** - Charts library
- **React ChartJS 2 5.2.0** - React wrapper for Chart.js

### Development Tools
- **Vite 5.0.0** - Fast build tool
- **@vitejs/plugin-react** - React plugin for Vite

## 🚀 Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot reloading enabled.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Preview
```bash
npm run preview
```
Previews the production build locally.

## 🎨 Key Features Breakdown

### 1. **Responsive Layout**
- Mobile-first design approach
- Sidebar collapses on smaller screens
- Adaptive grid layouts
- Touch-friendly interface

### 2. **Dashboard Summary Cards**
- Real-time metrics display
- Color-coded by category (Blue for revenue, Green for users, Orange for orders, Purple for growth)
- Percentage change indicators
- Hover animations and effects

### 3. **Interactive Charts**
- Monthly sales trends
- Order count visualization
- Dual-axis line and bar charts
- Responsive sizing
- Legend and tooltips

### 4. **Navigation**
- Active route highlighting
- Icon-based navigation items
- Smooth transitions and animations
- User profile dropdown area in navbar

### 5. **Data Tables**
- Sortable columns
- Status badges with color coding
- Action buttons (View, Edit, Delete)
- Pagination controls
- Search functionality

## 🎨 Color Scheme

- **Primary**: #007bff (Blue)
- **Success**: #28a745 (Green)
- **Warning**: #fd7e14 (Orange)
- **Danger**: #dc3545 (Red)
- **Purple**: #9b59b6
- **Background**: #f8f9fa
- **Text**: #333

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: 480px to 767px
- **Small Mobile**: Below 480px

## 🔧 Customization

### Adding a New Page
1. Create a new component in `src/pages/`
2. Import it in `App.tsx`
3. Add a new Route in the BrowserRouter
4. Add navigation item in `Sidebar.tsx`

### Modifying Colors
Edit the CSS variables in the respective component CSS files or update the color values in `src/index.css`

### Adding More Data
The current data is hardcoded for demo purposes. To integrate with a backend API:
1. Use React hooks (`useState`, `useEffect`)
2. Replace hardcoded data arrays with API calls
3. Handle loading and error states

## 📊 Chart Customization

Edit `src/components/SalesChart.tsx` to:
- Change chart types (line, bar, pie, etc.)
- Modify datasets and labels
- Update colors and styling
- Add new metrics

## 🔐 Security Considerations

For production use:
- Implement proper authentication
- Add environment variables for API endpoints
- Sanitize user inputs
- Implement HTTPS
- Add CSRF protection

## 🐛 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

This project is open source and available for educational and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and enhance this dashboard for your needs.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for the AutoAI Marketplace** 🚗
