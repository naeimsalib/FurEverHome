# Pet Adoption Portal Project Plan

## **User Story**

**As a user**, I want to easily browse pets available for adoption, filter them by type and location, and contact the pet owner to inquire about adoption.  
**As a pet owner**, I want to create a profile for my pet, add details like age and breed, and manage my pet's adoption profile securely.

---

## **MVP Functionality**

### **Core Features**

1. **Authentication and Authorization**:

   - Users can sign up and log in.
   - Session-based authentication ensures security.
   - Only logged-in users can create, edit, or delete pet profiles.
   - Only Users can edit there own pet profiles and there comments
   - Users also can remove a comment mad on there pets only

2. **CRUD for Pet Profiles**:

   - Logged-in users can:
     - Create a pet profile (name, age, breed,type(e.g., dog, cat), description, vaccination, location, and image/images).
     - Edit or delete their own pet profiles only.
   - Visitors can view pet profiles but cannot edit or delete them.
   - Visitors can add comments on other people pets

3. **Pet Profile Pages**:

   - Each pet has a detailed profile page displaying:
     - Name, breed, age, type (e.g., dog, cat), description, vaccination, location, and an image/images.
     - Contact form or contact details for the owner.

4. **Filtering and Searching**:

   - Visitors and users can search for pets by type (e.g., dog, cat) and/or location.

5. **Authorization Middleware**:

   - Ensures only the owner of a pet profile can edit or delete it.

6. **User Dashboard**:

   - A personalized dashboard where users can:
   - View their listed pets.

7. **Admin Panel**:

   - Add an admin role for managing inappropriate content or pet profiles.

---

## **Icebox Features (Post-MVP Enhancements)**

### **Favorites Feature**:

- Allow users to "favorite" pets they are interested in adopting.
- Create a "Favorites" section in the user dashboard.

### **Enhanced Search and Filters**:

- Add advanced filters like size, age, and vaccination status.

### **Pet Adoption Stories**:

- A section where adopters can share their pet adoption stories and images.
- Allows users to comment or like stories.

### **Multiple Images**:

- Allow pet owners to upload multiple images per pet profile.

### **Location Integration**:

- Integrate Google Maps to show the location of pets on their profiles.

### **Pet Adoption Workflow**:

- Add a "Request Adoption" button on each pet profile.
- Logged-in users can submit adoption requests, which will be sent to the pet owner.
- Create a dashboard for pet owners to review and manage adoption requests.
