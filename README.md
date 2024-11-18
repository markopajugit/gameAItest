# Tower Defense Game with Node.js and Three.js

## Overview
This is a 3D multiplayer Tower Defense game built with **Node.js**, **Socket.IO**, and **Three.js**. Players can collaboratively defend against waves of enemies by placing towers, which attack incoming enemies. The game supports real-time updates and is accessible at a custom path like `/game`.

---

## Server Requirements
1. **Node.js**: v14 or higher
2. **Nginx**: For reverse proxy configuration
3. **PM2**: For persistent server hosting (optional, recommended)

---

## Installation Steps
### 1. Install Dependencies
- Clone or extract this project to your server.
- Navigate to the project folder in your terminal.
- Install dependencies, including Three.js, using npm:
  ```bash
  npm install
  ```

### 2. Run the Server
- Start the server locally:
  ```bash
  node server.js
  ```
- To run persistently, use PM2:
  ```bash
  pm2 start server.js
  ```

### 3. Configure Reverse Proxy
- If using **Nginx**, add the following configuration to your server block:
  ```
  location /game {
      proxy_pass http://localhost:4000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
  }
  ```
- Restart Nginx:
  ```bash
  sudo service nginx restart
  ```

---

## Game Access
- Once the server is running, access the game in your browser at:
  ```
  http://your-server-domain/game
  ```

---

## Using Three.js with npm
Three.js is included as a dependency in this project via npm. The import statement is already added in the `public/game.js` file:
```javascript
import * as THREE from 'three';
```
Ensure that you run `npm install` to download the required dependencies before starting the server.

---

## Troubleshooting

### **1. Error: Cannot find module 'express'**
This error occurs when the `express` dependency is not installed. Follow these steps to resolve it:
1. Install the missing dependency:
   ```bash
   npm install express
   ```
2. If your project uses **Socket.IO**, install it as well:
   ```bash
   npm install socket.io
   ```
3. Start the server again:
   ```bash
   node server.js
   ```

If the problem persists:
- Clear the npm cache:
  ```bash
  npm cache clean --force
  ```
- Remove `node_modules` and `package-lock.json`, then reinstall dependencies:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Gameplay Instructions
1. Open the game in two browser windows for multiplayer testing.
2. Place towers by clicking on the map.
3. Towers attack enemies automatically.
4. Collaborate to protect shared health.

---

## Project Structure
- **server.js**: Backend logic for the game, including enemy spawning and movement.
- **public/index.html**: Entry point for the game’s UI.
- **public/game.js**: Game rendering and logic using Three.js.

---

## Notes
- Ensure your Node.js server is running on port 4000.
- Customize game mechanics, such as tower upgrades or enemy AI, in `server.js` and `game.js`.

Enjoy building and defending!
