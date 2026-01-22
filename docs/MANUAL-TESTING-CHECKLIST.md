# Manual Testing Checklist

## Test Environment Setup
- [ ] Browser: Chrome (latest)
- [ ] Browser: Firefox (latest)
- [ ] Browser: Safari (latest)
- [ ] Browser: Edge (latest)
- [ ] LocalStorage enabled
- [ ] JavaScript enabled
- [ ] Pop-ups/downloads allowed

## Test 1: Complete Flow - Bilty Generation

### Steps:
1. [ ] Open application (index.html or local server)
2. [ ] Verify redirect to login.html
3. [ ] Enter credentials: admin / admin123
4. [ ] Click "Login" button
5. [ ] Verify redirect to index.html
6. [ ] Verify main form is displayed

### Form Entry:
7. [ ] Enter Origin: "Mumbai, Maharashtra"
8. [ ] Enter Destination: "Delhi, NCR"
9. [ ] Enter Goods Description: "Electronic goods - Laptops"
10. [ ] Enter Weight: "150.5"
11. [ ] Enter Amount: "15000"
12. [ ] Enter Discount: "500"
13. [ ] Enter Taxes: "2700"
14. [ ] Enter eWay Bill Number: "EWB123456789012"
15. [ ] Enter eWay Bill Date: "2024-01-15"

### Validation:
16. [ ] Verify no validation errors appear
17. [ ] Click outside each field to trigger blur validation
18. [ ] Verify fields are accepted

### Save:
19. [ ] Click "Save" or submit form
20. [ ] Verify success message appears
21. [ ] Verify document generation buttons are enabled

### Generate Bilty:
22. [ ] Click "Generate Bilty" button
23. [ ] Verify bilty document preview appears
24. [ ] Verify document contains:
    - [ ] Company logo
    - [ ] Company name and address
    - [ ] Origin: Mumbai, Maharashtra
    - [ ] Destination: Delhi, NCR
    - [ ] Goods Description: Electronic goods - Laptops
    - [ ] Weight: 150.5 kg
    - [ ] Amount: ₹15000
    - [ ] eWay Bill Number: EWB123456789012
    - [ ] Signature image
    - [ ] Seal image

### PDF Download:
25. [ ] Click "Download PDF" button
26. [ ] Verify PDF download starts
27. [ ] Open downloaded PDF
28. [ ] Verify PDF contains all information from preview
29. [ ] Verify PDF filename format: bilty_YYYYMMDD_*.pdf
30. [ ] Verify PDF is A4 size and print-ready

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 2: Complete Flow - Invoice Generation

### Steps:
1. [ ] Continue from logged-in state (or login again)
2. [ ] Enter same freight details as Test 1
3. [ ] Click "Save" or submit form
4. [ ] Verify success message

### Generate Invoice:
5. [ ] Click "Generate Invoice" button
6. [ ] Verify invoice document preview appears
7. [ ] Verify document contains:
    - [ ] Company logo
    - [ ] Company name and address
    - [ ] Invoice number
    - [ ] Origin: Mumbai, Maharashtra
    - [ ] Destination: Delhi, NCR
    - [ ] Goods Description: Electronic goods - Laptops
    - [ ] Weight: 150.5 kg
    - [ ] Base Amount: ₹15000
    - [ ] Discount: ₹500
    - [ ] Taxes: ₹2700
    - [ ] Total: ₹17200 (15000 - 500 + 2700)
    - [ ] eWay Bill Number: EWB123456789012
    - [ ] Signature image
    - [ ] Seal image

### Calculation Verification:
8. [ ] Verify calculation: (15000 - 500) + 2700 = 17200
9. [ ] Verify all amounts are displayed correctly

### PDF Download:
10. [ ] Click "Download PDF" button
11. [ ] Verify PDF download starts
12. [ ] Open downloaded PDF
13. [ ] Verify PDF contains all information from preview
14. [ ] Verify PDF filename format: invoice_YYYYMMDD_*.pdf
15. [ ] Verify PDF is A4 size and print-ready

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 3: Complete Flow - Generate Both Documents

### Steps:
1. [ ] Continue from logged-in state (or login again)
2. [ ] Enter freight details (can use same as above)
3. [ ] Click "Save" or submit form
4. [ ] Verify success message

### Generate Both:
5. [ ] Click "Generate Both" button
6. [ ] Verify both bilty and invoice previews appear
7. [ ] Verify bilty contains all required information
8. [ ] Verify invoice contains all required information
9. [ ] Verify both documents show consistent data:
    - [ ] Same origin
    - [ ] Same destination
    - [ ] Same goods description
    - [ ] Same weight
    - [ ] Same amounts
    - [ ] Same eWay bill information

### PDF Downloads:
10. [ ] Verify separate download buttons for bilty and invoice
11. [ ] Click "Download Bilty PDF"
12. [ ] Verify bilty PDF downloads
13. [ ] Click "Download Invoice PDF"
14. [ ] Verify invoice PDF downloads
15. [ ] Open both PDFs and verify content
16. [ ] Verify both PDFs have correct filenames

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 4: Validation Errors Display

### Test Empty Required Fields:
1. [ ] Clear browser data or use new session
2. [ ] Login with admin / admin123
3. [ ] Leave Origin field empty
4. [ ] Click in Destination field (trigger blur on Origin)
5. [ ] Verify error message appears: "This field is required"
6. [ ] Verify Origin field is highlighted in red
7. [ ] Enter value in Origin field
8. [ ] Verify error clears

### Test Invalid Numeric Values:
9. [ ] Enter "-50" in Weight field
10. [ ] Click outside field
11. [ ] Verify error message: "Please enter a positive number"
12. [ ] Verify field is highlighted in red
13. [ ] Enter "150" in Weight field
14. [ ] Verify error clears

### Test Non-Numeric Values:
15. [ ] Enter "abc" in Amount field
16. [ ] Click outside field
17. [ ] Verify error message appears
18. [ ] Verify field is highlighted in red
19. [ ] Enter "15000" in Amount field
20. [ ] Verify error clears

### Test Form Submission with Errors:
21. [ ] Leave Destination field empty
22. [ ] Try to submit form
23. [ ] Verify form submission is prevented
24. [ ] Verify error summary message appears
25. [ ] Fill in Destination field
26. [ ] Verify form can now be submitted

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 5: Session Persistence

### Test Session Remains Active:
1. [ ] Login with admin / admin123
2. [ ] Enter some freight details (don't submit)
3. [ ] Refresh the page (F5 or Ctrl+R)
4. [ ] Verify you remain logged in
5. [ ] Verify you're not redirected to login page
6. [ ] Verify main form is still displayed

### Test Session Across Tabs:
7. [ ] Open application in new tab
8. [ ] Verify you're automatically logged in
9. [ ] Verify no login required

### Test Session Data:
10. [ ] Check browser LocalStorage
11. [ ] Verify sessionToken exists
12. [ ] Verify session data includes userId and expiresAt

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 6: Logout Functionality

### Steps:
1. [ ] Ensure you're logged in
2. [ ] Click "Logout" button
3. [ ] Verify redirect to login.html
4. [ ] Verify session is terminated
5. [ ] Try to navigate to index.html directly
6. [ ] Verify redirect back to login.html
7. [ ] Check LocalStorage
8. [ ] Verify sessionToken is removed

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 7: Browser Compatibility - Chrome

### Environment:
- Browser: Google Chrome
- Version: _________

### Tests:
1. [ ] Login works correctly
2. [ ] Form validation works
3. [ ] Data saves successfully
4. [ ] Bilty generates correctly
5. [ ] Invoice generates correctly
6. [ ] Both documents generate correctly
7. [ ] PDF downloads work
8. [ ] PDFs open and display correctly
9. [ ] No console errors
10. [ ] All images load (logo, signature, seal)

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 8: Browser Compatibility - Firefox

### Environment:
- Browser: Mozilla Firefox
- Version: _________

### Tests:
1. [ ] Login works correctly
2. [ ] Form validation works
3. [ ] Data saves successfully
4. [ ] Bilty generates correctly
5. [ ] Invoice generates correctly
6. [ ] Both documents generate correctly
7. [ ] PDF downloads work
8. [ ] PDFs open and display correctly
9. [ ] No console errors
10. [ ] All images load (logo, signature, seal)

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 9: Browser Compatibility - Safari

### Environment:
- Browser: Apple Safari
- Version: _________

### Tests:
1. [ ] Login works correctly
2. [ ] Form validation works
3. [ ] Data saves successfully
4. [ ] Bilty generates correctly
5. [ ] Invoice generates correctly
6. [ ] Both documents generate correctly
7. [ ] PDF downloads work
8. [ ] PDFs open and display correctly
9. [ ] No console errors
10. [ ] All images load (logo, signature, seal)

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 10: Browser Compatibility - Edge

### Environment:
- Browser: Microsoft Edge
- Version: _________

### Tests:
1. [ ] Login works correctly
2. [ ] Form validation works
3. [ ] Data saves successfully
4. [ ] Bilty generates correctly
5. [ ] Invoice generates correctly
6. [ ] Both documents generate correctly
7. [ ] PDF downloads work
8. [ ] PDFs open and display correctly
9. [ ] No console errors
10. [ ] All images load (logo, signature, seal)

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 11: Document Output Quality

### Print Preview Test:
1. [ ] Generate a bilty document
2. [ ] Open print preview (Ctrl+P or Cmd+P)
3. [ ] Verify document fits on A4 page
4. [ ] Verify all content is visible
5. [ ] Verify no content is cut off
6. [ ] Verify images are clear
7. [ ] Verify text is readable

### PDF Quality Test:
8. [ ] Download bilty as PDF
9. [ ] Open PDF in PDF reader
10. [ ] Verify document is A4 size
11. [ ] Verify all content is visible
12. [ ] Verify images are high quality
13. [ ] Verify text is crisp and readable
14. [ ] Verify colors are correct
15. [ ] Print PDF to physical printer (if available)
16. [ ] Verify printed output is professional quality

### Invoice Quality Test:
17. [ ] Repeat steps 1-16 for invoice document

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test 12: PDF Download Functionality

### Single Document Download:
1. [ ] Generate bilty document
2. [ ] Click download button
3. [ ] Verify browser download starts
4. [ ] Verify file saves to downloads folder
5. [ ] Verify filename format is correct
6. [ ] Open PDF and verify content

### Multiple Downloads:
7. [ ] Generate both documents
8. [ ] Download bilty PDF
9. [ ] Download invoice PDF
10. [ ] Verify both files are in downloads folder
11. [ ] Verify both have unique filenames
12. [ ] Verify both PDFs contain correct content

### Download Blocking Test:
13. [ ] Block downloads in browser settings
14. [ ] Try to download PDF
15. [ ] Verify appropriate error message or fallback

### Result: ✅ PASS / ❌ FAIL
**Notes:**

---

## Test Summary

| Test # | Test Name | Chrome | Firefox | Safari | Edge | Notes |
|--------|-----------|--------|---------|--------|------|-------|
| 1 | Bilty Generation | | | | | |
| 2 | Invoice Generation | | | | | |
| 3 | Generate Both | | | | | |
| 4 | Validation Errors | | | | | |
| 5 | Session Persistence | | | | | |
| 6 | Logout | | | | | |
| 7 | Chrome Compatibility | ✅ | - | - | - | |
| 8 | Firefox Compatibility | - | ✅ | - | - | |
| 9 | Safari Compatibility | - | - | ✅ | - | |
| 10 | Edge Compatibility | - | - | - | ✅ | |
| 11 | Document Quality | | | | | |
| 12 | PDF Downloads | | | | | |

## Overall Result: ✅ PASS / ❌ FAIL

## Critical Issues Found:
1. 
2. 
3. 

## Minor Issues Found:
1. 
2. 
3. 

## Recommendations:
1. 
2. 
3. 

---

**Tester Name:** _________________
**Date:** _________________
**Signature:** _________________
