# Client Quick Actions - Testing Plan

## Overview
Testing plan for the three quick actions implemented on the client details page: Create New Ticket, Schedule Appointment, and Send Email.

## Prerequisites
- Development server running on http://localhost:3001/
- Backend API server running on localhost:8080
- Test client with existing data (tickets/appointments)

## Test Scenarios

### 1. Create New Ticket Quick Action

#### Test Case 1.1: Basic Ticket Creation
**Steps**:
1. Navigate to any client details page
2. Click "Create New Ticket" in Quick Actions
3. Verify modal opens with title "Create New Ticket"
4. Verify client dropdown is pre-populated and disabled with current client
5. Fill in required fields:
   - Title: "Test ticket from quick action"
   - Description: "Testing the quick action functionality"
   - Service Type: Select "SOFTWARE"
   - Priority: Select "HIGH"
6. Click "Create Ticket"

**Expected Results**:
- Modal closes after successful creation
- Client tickets section refreshes and shows new ticket
- New ticket appears at top of tickets list
- Success message appears (if implemented)

#### Test Case 1.2: Ticket Form Validation
**Steps**:
1. Click "Create New Ticket"
2. Leave title empty and try to submit
3. Verify validation error appears
4. Fill title but leave description empty
5. Try to submit again

**Expected Results**:
- Validation prevents submission with empty required fields
- Error messages are clear and helpful
- Form stays open until valid data is provided

### 2. Schedule Appointment Quick Action

#### Test Case 2.1: Schedule Appointment (With Open Tickets)
**Prerequisites**: Client must have at least one open ticket

**Steps**:
1. Navigate to client with open tickets
2. Click "Schedule Appointment" in Quick Actions
3. Verify modal opens with title "Schedule Appointment"
4. Verify ticket dropdown only shows client's open tickets
5. Select a ticket and technician
6. Set appointment date/time (1 hour from now)
7. Add optional notes: "Quick action appointment test"
8. Click "Create Appointment"

**Expected Results**:
- Modal closes after successful creation
- Client appointments section refreshes
- New appointment appears in the list
- Appointment shows correct client and ticket info

#### Test Case 2.2: Schedule Appointment (No Open Tickets)
**Prerequisites**: Client must have NO open tickets

**Steps**:
1. Navigate to client without open tickets
2. Click "Schedule Appointment" in Quick Actions
3. Verify confirmation dialog appears asking to create ticket first
4. Click "OK" to create ticket first
5. Verify ticket creation modal opens

**Expected Results**:
- Appropriate message shown when no open tickets exist
- User is prompted to create ticket first
- Ticket creation modal opens when user confirms

### 3. Send Email Quick Action

#### Test Case 3.1: Email Contact Modal
**Steps**:
1. Navigate to any client details page
2. Click "Send Email" in Quick Actions
3. Verify contact modal opens with title "Contact [Client Name]"
4. Verify modal displays:
   - Client email address
   - Client phone number (formatted)
   - Client address (if available)

**Expected Results**:
- Modal opens with complete contact information
- All contact details are properly formatted
- Icons are displayed correctly for each contact method

#### Test Case 3.2: Email Client Launch
**Steps**:
1. Click "Send Email" quick action
2. In the contact modal, click "Open Email Client"
3. Verify default email client opens
4. Verify email is addressed to correct client email
5. Close email client and return to browser
6. Click "Close" to dismiss modal

**Expected Results**:
- Default email application launches
- Email is pre-addressed to client's email
- Modal remains open until manually closed
- Modal closes when "Close" button clicked

### 4. Integration and Edge Cases

#### Test Case 4.1: Multiple Quick Actions in Sequence
**Steps**:
1. Open "Create New Ticket" → Cancel
2. Open "Schedule Appointment" → Cancel  
3. Open "Send Email" → Close
4. Open "Create New Ticket" again → Complete creation
5. Immediately open "Schedule Appointment" → Should now work

**Expected Results**:
- All modals open and close properly
- No state interference between actions
- Creating ticket enables appointment scheduling

#### Test Case 4.2: Data Refresh Validation
**Steps**:
1. Note current ticket count in summary
2. Create new ticket via quick action
3. Verify ticket count increments
4. Note current appointment count
5. Create new appointment via quick action
6. Verify appointment count increments

**Expected Results**:
- Summary statistics update immediately
- Data is consistent across all sections
- No page refresh required

#### Test Case 4.3: Error Handling
**Steps**:
1. Create ticket with duplicate title (if validation exists)
2. Try to schedule appointment with past date
3. Test with network disconnected
4. Test with invalid email format

**Expected Results**:
- Appropriate error messages displayed
- Forms remain open for correction
- No application crashes
- User-friendly error handling

### 5. UI/UX Validation

#### Test Case 5.1: Modal Responsiveness
**Steps**:
1. Test quick actions on desktop (1920x1080)
2. Test on tablet size (768x1024)
3. Test on mobile size (375x667)
4. Verify all modals are readable and usable

**Expected Results**:
- Modals resize appropriately for screen size
- All content remains accessible
- Buttons remain clickable
- Text is readable at all sizes

#### Test Case 5.2: Keyboard Navigation
**Steps**:
1. Use Tab key to navigate through quick action buttons
2. Press Enter to activate "Create New Ticket"
3. Use Tab to navigate form fields
4. Press Esc to close modal
5. Repeat for all quick actions

**Expected Results**:
- All buttons are keyboard accessible
- Tab order is logical
- Enter key activates buttons
- Esc key closes modals
- Focus management works correctly

### 6. Performance Testing

#### Test Case 6.1: Quick Action Response Times
**Steps**:
1. Measure time from click to modal open
2. Measure form submission time
3. Measure data refresh time after creation
4. Test with slow network connection

**Expected Results**:
- Modal opens within 200ms
- Form submissions complete within 2 seconds
- Data refresh occurs within 3 seconds
- Loading states shown during operations

## Test Completion Checklist

- [ ] Create New Ticket works with pre-populated client
- [ ] Schedule Appointment handles open/no tickets correctly
- [ ] Send Email displays contact info and launches email client
- [ ] All modals open and close properly
- [ ] Data refreshes after successful operations
- [ ] Form validation works correctly
- [ ] Error handling is user-friendly
- [ ] Responsive design works on all screen sizes
- [ ] Keyboard navigation functions properly
- [ ] Performance is acceptable

## Issues Found
_(Document any issues discovered during testing)_

## Test Results Summary
- Date: ______________
- Tester: ____________
- Overall Status: _____
- Critical Issues: ____
- Minor Issues: ______