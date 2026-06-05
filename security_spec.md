# Security Specification (Phase 0)

## 1. Data Invariants
- **Owner Isolation**: Saved diagnostics must only be accessible (read/write/delete/list) by the authenticated user who created them.
- **Identity Mutation Protection**: Once created, a diagnostic's ownership Uid (`userId`) and creation timestamp (`createdAt`) are completely immutable.
- **Payload Safety**: Input parameters such as logs, bug reports, and code contexts are length-restricted (e.g., maximum size limits on strings) to protect against stack-overflows or wallet-denial attacks.

## 2. Testing Payloads ("Dirty Dozen")
To protect the database under all circumstances, the following payloads are strictly rejected:
1. Creating a diagnostic when completely logged out (Anonymous triggers allowed option but session must exist).
2. Forging ownership to a different `userId`.
3. Creating a diagnostic containing a non-server timestamp.
4. Accessing or listing someone else's debugging reports.
5. Updating another user's diagnostics fields.
6. Triggering a shadow update with non-whitelisted properties.
7. Injecting massive (> 50KB) debug report payload strings.
8. Deleting someone else's document diagnostic report.
9. ID poisoning using custom non-alphanumeric unicode target keys.
10. Relational schema spoofing with empty structures.
11. Attempting an empty write.
12. Forging system AI diagnostic responses.

## 3. Firestore Rules Structure
The secure Firestore rules are drafted under `/firestore.rules` containing precise checks.
