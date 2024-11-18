# Tower Defense Game - Deployment and Setup Instructions

## Requirements
1. **Server Requirements**:
   - Node.js (v16 or higher recommended).
   - Nginx (or Apache) for reverse proxy.
   - A running Linux server or equivalent environment.

2. **Dependencies**:
   - Express.js and Socket.IO (installed via npm).
   - Three.js (included via CDN in the frontend).

3. **Tools**:
   - PM2 (optional) for managing the server.

---

## Step-by-Step Setup

### 1. Install Node.js and npm
If Node.js is not already installed, use the following commands:
```bash
sudo apt update
sudo apt install -y nodejs npm
```

Verify installation:
```bash
node -v
npm -v
```

### 2. Install PM2 (optional but recommended)
Install PM2 to run the server persistently:
```bash
npm install -g pm2
```

### 3. Extract the Game Files
Extract the provided ZIP file and navigate to the folder:
```bash
unzip TowerDefenseGame.zip
cd TowerDefenseGame
```

### 4. Install Dependencies
Run the following command to install the necessary Node.js packages:
```bash
npm install express socket.io
```

### 5. Test the Server
Start the server manually for testing:
```bash
node server.js
```

Access the game at `http://<your-server-ip>:4000/game`.

### 6. Configure Reverse Proxy
Set up Nginx to route `/game` to the Node.js server:

1. Open your Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

2. Add the following block:
   ```
   server {
       server_name your-domain.com;

       location /game {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           # Other configurations for your site
       }
   }
   ```

3. Restart Nginx:
   ```bash
   sudo service nginx restart
   ```

Now, the game will be accessible at `http://your-domain.com/game`.

### 7. Run the Server Persistently
Use PM2 to run the server in the background:
```bash
pm2 start server.js
```

Check the server status:
```bash
pm2 status
```

---

## Gameplay Instructions
1. Open the game in two browser tabs or devices.
2. Place towers by clicking on the map.
3. Defend against enemies coming from two directions and merging into one lane.
4. Monitor shared health and individual gold at the top of the screen.

---

## Useful Tips
- **Customization**:
  - Modify the `server.js` file to change enemy spawn rates or health.
  - Update the `game.js` file to add new features like tower upgrades.

- **Debugging**:
  - Check server logs using PM2:
    ```bash
    pm2 logs
    ```

- **Stopping the Server**:
  - Stop the server with:
    ```bash
    pm2 stop server.js
    ```

---

For further assistance, contact your system administrator or refer to the provided code comments.
