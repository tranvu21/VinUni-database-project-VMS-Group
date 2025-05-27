# University Activity Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge)](https://vinuni-database-project-cloned.vercel.app/dashboard)


## Team Member
- Tran Anh Vu - V202100569 
- Nguyen Nhat Minh - V202100523 
- Nguyen Hoang Son - V202100578
## 📄 Project Description

The **University Activity Management System (UAMS)** is designed to help colleges and universities manage various academic and administrative activities. The system allows users with different roles, such as students, professors, and staff, to interact with the database based on their access rights. 

Key functionalities include:
- **Student Access**: Register for courses in a given semester, view grades, GPA, and academic history.
- **Professor/Staff Access**: View schedules, salary information, and other relevant administrative data.
- **Administrative Functions**: Manage department and course data, assign professors to courses, and monitor student registrations.

The system aims to improve the efficiency of academic management and provide easy access to academic records for students and staff, fostering better communication and resource allocation within the university.

---

## 🎯 Functional & Non-functional Requirements

### Functional Requirements
- **User Role**: Users can reach the appropriate interface based on their role (Student, Professor, Staff).
- **Student Features**: Register for courses, view grades, GPA, and course schedules.
- **Professor Features**: View schedules, view assigned courses, manage grades for students.
- **Staff Features**: Access administrative data like salary and work schedules.
- **Course Management**: Admin users can add/edit courses, assign professors to courses.
- **Department Management**: Manage departments, assign staff to departments, and track department-related data.

### Non-functional Requirements
- **Security**: Sensitive data, such as grades and salary information, should be encrypted.
- **Scalability**: The system should support a growing number of students, professors, and courses as the university expands.
- **Availability**: The system should be available 99% of the time to avoid disruptions in academic operations.
- **Performance**: The system should handle multiple concurrent users without significant delays.
- **Usability**: The system should be intuitive and easy to navigate for users of all technical levels.

---

## 🧱 Planned Core Entities

- **Student**: Represents a student enrolled in the university, with attributes like name, major, GPA, enrolled courses, and academic history.
- **Professor** : Represents a professor or faculty member, with attributes like name, department, assigned courses, and salary information.
- **Staff**: Represents administrative staff, with attributes like name, department, position, and work schedule.
- **Course**: Course details (course name, course code, credits, semester).
- **Schedule**: Schedules for courses, professors, and staff.
- **Department**: Department details (name, head of department, assigned courses).
---

## 🔧 Tech Stack

- **Database**: MySQL
- **Backend**: Python
- **Frontend**: HTML, CSS, JavaScript (React.js for UI)
- **Version Control**: Git and GitHub for repository management
- **API Testing**: Postman
---

## 👥 Team Members and Roles

- **Tran Anh Vu**: Project Manager, Backend Development (Node.js, API design, Database design)
- **Nguyen Nhat Minh**: Frontend Developer (UI design, user experience)
- **Nguyen Hoang Son**: Database Administrator (MySQL setup, database schema, and query optimization)

---

## 📅 Timeline (Planned Milestones)

| **Milestone**                                      | **Deadline**          | **Summary**                                                                 |
|---------------------------------------------------|-----------------------|-----------------------------------------------------------------------------|
| **Milestone 1: Team Registration & Topic Selection** | May 6        | Finalize the team and confirm the project topic (University Activity Management System) to initiate the project. |
| **Milestone 2: Database Design & Task Division**   |  May 11       | Create the database design (ERD, DDL) and divide tasks among team members for project execution. |
| **Milestone 3: Backend Development (API & Authentication)** | May 18       | Develop the backend with Python, including user authentication and basic CRUD functionality for managing students, professors, and staff. |
| **Milestone 4: Frontend Development & Integration (Run parallel with milestone 3)** |  May 20       | Build the frontend interface and integrate it with the backend API, ensuring role-based access to system features. |
| **Milestone 5: Role-based Features Implementation, Testing** | May 22       | Implement role-specific features for students, professors, and staff, and ensure correct access and functionality for each user type. |
| **Milestone 6: Documentation & Presentation** | May 26     | Conduct final testing, prepare documentation, and create the presentation slide to showcase the system and its functionalities. |


---


