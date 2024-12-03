# ft_transcendence - Ping Pong Game

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/Home.jpeg" width="1000" height="500" alt="Pong Image" >

ft_transcendence is an innovative web application that modernizes the 1979 classic Pong into an engaging competitive gaming platform. This multiplayer game offers both online and local matches, as well as the option to challenge an AI player. Players can organize and participate in tournaments, with features that manage registrations, victories, rankings, and progression.

The platform also includes a robust chat system for real-time communication with friends, a profile section to view friends, manage blocked users, track pending invitations, and a detailed match history with statistics. It is designed with a focus on user management, security, and creating an unparalleled gaming experience.

ft_transcendence is not just about playing games—it's about building a community and turning casual fun into competitive excitement, marking a milestone project for developers aspiring to transition into professional fields of expertise.

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Showcase](#showcase)
- [Contributors](#contributors)

## Description

This project focuses on developing a modernized Pong game using cutting-edge technologies. The front end is built with React.js for a dynamic user interface, Tailwind CSS for sleek and responsive styling, and TypeScript for enhanced type safety and maintainable code. On the backend, it leverages the power of Django and PostgreSQL to ensure robust functionality and secure data management.

## Features

* **Real-time Multiplayer Pong Games**: Challenge friends or random opponents to exciting Pong matches in real time.</br>

* **Local game and AI opponent**: Enjoy offline play against a friend on your device or test your skills against a smart AI opponent.</br>

* **Stats**: Review your match history, including detailed stats for your last 10 games.</br>

* **User-Friendly Interface**: Experience a sleek and intuitive interface designed for smooth and enjoyable gameplay.</br>

* **Integrated Chat System**: Connect with other players through a built-in chat feature, fostering communication and a sense of community.</br>

* **OAuth Login (42 Intranet and Google)**: Log in effortlessly using your 42 Intranet credentials or Google account for quick access.</br>

* **Two-Factor Authentication (2FA)**: Strengthen account security with 2FA, keeping your data and profile safe.</br>

* **Friend Management**: Build your gaming network, add friends, and invite them to matches with ease.</br>

* **Matchmaking System**: Enjoy automatic pairing with players of similar skill levels for fair and competitive matches.</br>

* **Responsive Web Design and Browser Compatibility**: The web application is fully optimized for all devices, offering a seamless experience across desktops, tablets, and smartphones.</br>

* **Security Enhancements**: Web Application Firewall (WAF) with ModSecurity and hardened configurations, Secrets Management with HashiCorp Vault, Two-Factor Authentication (2FA) with JWT integration for added account protection.</br>

## Technologies Used

### Front End

* **React.js**: A JavaScript library for building user interfaces.

* **TypeScript**: providing type safety and enhanced developer productivity.

* **Tailwind CSS**: A utility-first CSS framework for styling the front end.

* **Framer Motion**: Used for adding animations and transitions to the user interface.

### Back End

* **Django**: Python framework for building efficient, scalable, and maintainable server-side applications.

* **PostgreSQL**: A powerful, open-source relational database management system.

* **JWT (JSON Web Tokens)**: Used for authentication and token-based authorization.
* **WebSocket**: A communication protocol for real-time, bidirectional data transfer.

### Containerization and Orchestration

* **Docker and Docker Compose**: Used to define and manage multi-container Docker applications.

### Communication

* **RESTful API** and **Web Socket**

# Setup

> Clone this repo
```
git clone git@github.com:ochouikh/ft_transcendence.git
```

> Run the application
```
make
```

> browser access

```
go to 'https://localhost'
```

> Remove all docker containers, images and volumes
```
make clean
```

## Showcase

Join us as we explore the exciting features our project brings to the table!

### Login - Sign up - 2FA - Frorget Password </br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/Login.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/Sign%20Up.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/2FA.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/Forget%20password.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/Forget%20password-1.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/login%20-%20sign%20up/Forget%20password-2.png" alt="image" width="700" height="auto">
</br>

### Dashboard - Notification
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/Dashboard.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/Dashboard-1.png" alt="image" width="700" height="auto">

### Settings
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/Settings.png" alt="image" width="700" height="auto">

### Profile
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/profile/Profile.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/profile/friends.png" alt="image" width="700" height="auto">

### Grades
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/grades.png" alt="image" width="700" height="auto">

### Game - Match Making
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/MatchMaking%20-%20step%201.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/MatchMaking%20-%20step%202.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(1).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(2).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(3).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(4).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(5).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(6).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game%20(7).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/Ping%20Pong%20Game.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/single%20player%20(1).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/game/single%20player.png" alt="image" width="700" height="auto">

### Tournament
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/tournament/Dashboard-2.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/tournament/Dashboard-3.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/tournament/table.png" alt="image" width="700" height="auto">

### Chat
</br></br>

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/chat/Live%20Chat.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/chat/Live%20Chat-1.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/chat/Ping%20Pong%20Game%20(1).png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/chat/conversation%20frame.png" alt="image" width="700" height="auto">

<img src="https://github.com/ochouikh/ft_transcendence/blob/master/showcase_images/chat/chat-responsive.png" alt="image" width="700" height="auto">

</br>

# Contributors
* [El Mehdi Bennamrouche](https://github.com/bennamrouche)
* [Mohssine El Aini](https://github.com/mel-aini)
* [sana izgunan](https://github.com/sizgunan)
* [Yassin Ettabaa](https://github.com/yettabaa)
