# Client Management Testing Plan

## Overview
This document outlines the testing procedures for the newly implemented Client Management functionality using ShadCN UI components.

## Prerequisites
1. **API Server Running**: Ensure the Java API server is running on `localhost:8080`
   ```bash
   cd cli/
   mvn compile exec:java -Dexec.mainClass="com.localtechsupport.cli.CliApplication" -Dexec.args="interactive"
   # OR start a basic HTTP server for the API
   ```

2. **Web App Running**: Start the React development server
   ```bash
   cd webapp/
   npm run dev
   # Open http://localhost:3000
   ```

## Manual Testing Procedures

### 1. Page Load and Navigation
- [ ] Navigate to http://localhost:3000
- [ ] Click "Clients" in the sidebar navigation
- [ ] Verify the page loads with "Clients" header
- [ ] Verify professional UI styling with ShadCN components

### 2. Client Data Display
- [ ] Verify client data loads from API (should show 8 sample clients)
- [ ] Check data table displays properly with columns: ID, Name, Email, Phone, Status, Created, Actions
- [ ] Verify proper formatting:
  - [ ] Phone numbers formatted as (XXX) XXX-XXXX
  - [ ] Dates formatted as "Mon DD, YYYY"
  - [ ] Status badges with proper colors (Active=green, Suspended=yellow, Terminated=red)

### 3. Search and Filtering
- [ ] **Search Functionality**:
  - [ ] Type "John" in search box → should filter to "John Doe"
  - [ ] Type "sarah" (lowercase) → should filter to "Sarah Johnson"
  - [ ] Type "company.com" → should filter to "Sarah Johnson"
  - [ ] Clear search → should show all clients

- [ ] **Status Filtering**:
  - [ ] Select "Active" → should show 7 active clients
  - [ ] Select "Suspended" → should show 1 suspended client (David Brown)
  - [ ] Select "Terminated" → should show 0 terminated clients
  - [ ] Select "All Statuses" → should show all 8 clients

- [ ] **Combined Filtering**:
  - [ ] Search "david" + filter "Suspended" → should show David Brown
  - [ ] Search "john" + filter "Suspended" → should show "No clients found"
  - [ ] Click "Clear Filters" → should reset both search and filter

### 4. Statistics Dashboard
- [ ] Verify statistics cards at bottom show correct counts:
  - [ ] Total Clients: 8
  - [ ] Active: 7 (green)
  - [ ] Suspended: 1 (yellow)
  - [ ] Terminated: 0 (red)

### 5. Client Creation Modal
- [ ] **Modal Opening**:
  - [ ] Click "New Client" button → modal should open
  - [ ] Verify modal title "Create New Client"
  - [ ] Verify all form fields are present and empty

- [ ] **Form Validation**:
  - [ ] Submit empty form → should show validation errors
  - [ ] Enter invalid email → should show "Invalid email address"
  - [ ] Enter short phone → should show "Phone number must be at least 10 digits"
  - [ ] Fill valid data → validation errors should clear

- [ ] **Successful Creation**:
  ```
  First Name: Test
  Last Name: User
  Email: test.user@example.com
  Phone: 5551234567
  Address: 123 Test St
  Status: Active
  Notes: Test client for verification
  ```
  - [ ] Click "Create Client" → should show success message
  - [ ] Modal should close automatically
  - [ ] New client should appear in the table
  - [ ] Statistics should update (Total: 9, Active: 8)

### 6. Error Handling
- [ ] **API Server Down**:
  - [ ] Stop the API server
  - [ ] Refresh page → should show error alert with "Failed to load clients"
  - [ ] Click "Try Again" → should retry API call

- [ ] **Network Errors**:
  - [ ] Verify proper error messages for timeouts
  - [ ] Verify retry functionality works

### 7. Responsive Design
- [ ] **Desktop (1200px+)**:
  - [ ] Full table with all columns visible
  - [ ] Proper spacing and layout

- [ ] **Tablet (768-1199px)**:
  - [ ] Table remains functional
  - [ ] Sidebar collapses to overlay

- [ ] **Mobile (320-767px)**:
  - [ ] Table scrolls horizontally if needed
  - [ ] Form fields stack vertically
  - [ ] Touch-friendly button sizes

### 8. Theme Support
- [ ] **Light Theme**:
  - [ ] Click theme toggle → switch to light mode
  - [ ] Verify proper contrast and readability
  - [ ] All components render correctly

- [ ] **Dark Theme**:
  - [ ] Click theme toggle → switch to dark mode
  - [ ] Verify proper contrast and readability
  - [ ] Status badges remain visible and readable

### 9. Loading States
- [ ] **Initial Load**:
  - [ ] Refresh page → should show skeleton loaders
  - [ ] Data loads → skeletons should be replaced with content

- [ ] **Form Submission**:
  - [ ] Create client → form should show loading spinner
  - [ ] Button should be disabled during submission

### 10. Performance
- [ ] **Page Load**:
  - [ ] Initial page load < 2 seconds
  - [ ] Search/filter responses feel instant
  - [ ] No visible layout shifts

## Programmatic Testing

### Run Automated Tests
```bash
cd webapp/
npm test -- --run
```

### Build Verification
```bash
cd webapp/
npm run build
npm run lint  # Fix any critical errors
npm run type-check
```

### API Integration Tests
```bash
# Test API endpoints directly
curl http://localhost:8080/api/clients
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"API","lastName":"Test","email":"api.test@example.com","phone":"5559999999","status":"ACTIVE"}'
```

## Expected Results

### Success Criteria
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] Responsive design works on all screen sizes
- [ ] Theme switching works correctly
- [ ] API integration functions properly
- [ ] Form validation prevents invalid submissions
- [ ] Loading states provide good user feedback
- [ ] Error handling gracefully manages failures

### Performance Benchmarks
- [ ] Page loads in < 2 seconds
- [ ] Search/filter responses < 200ms
- [ ] Form submissions < 1 second
- [ ] No memory leaks in React DevTools

## Troubleshooting

### Common Issues
1. **API Server Not Running**: Start with `cd cli && mvn compile exec:java -Dexec.mainClass="com.localtechsupport.cli.CliApplication" -Dexec.args="interactive"`
2. **Port Conflicts**: Webapp runs on :3000, API on :8080
3. **CORS Issues**: API should allow localhost origins
4. **Build Errors**: Run `npm install` if dependencies are missing

### Debug Tools
- React Developer Tools
- Network tab for API calls
- Console for JavaScript errors
- Lighthouse for performance

## Next Steps
Once Client Management testing is complete and all tests pass:
1. Implement Technician Management with similar ShadCN UI patterns
2. Add client detail pages with edit functionality  
3. Implement Ticket Management with client assignment
4. Add integration tests between components

---

*This test plan ensures the Client Management implementation meets professional standards and provides a solid foundation for the remaining system components.*