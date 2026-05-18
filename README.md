PARA MO START:
Just do this:

npm install

npm run dev

Take note: dapat naa mo sa ShareEthNotes Folder


For running the backend:
go to the shareth-backend folder then : "npm install mongodb@4.1" then node "server.js" to run

add this to the 
BlockChain-dApp/.env:
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxOTI3N2RlNC00MmY4LTRiOTgtYjYxYy03OGQwMTI3MzJmNTAiLCJlbWFpbCI6Im5hdmFsY29tbWFuZGVyOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjdjMDU0MDlhYTFjYzQ2MDdhNzMiLCJzY29wZWRLZXlTZWNyZXQiOiI1NmVkODMzNzQ3NGNmODRiZmJhZmNkZDM4MTRhMDBiYTRiZTZiYjM3MGQzNzkwMzAwYjYxZmYwNmM5OWUyNmU2IiwiZXhwIjoxODEwMDUwNzUyfQ.8mfD58UNgdlOTlWaN22fmS8CpxgTe80iqz7_v8ISPWM
VITE_API_URL=http://localhost:5000

BlockChain-dApp/shareth-backend/.env:
MONGODB_URI=mongodb+srv://navalcommander8_db_user:Vx3COLjCY9yZrFDw@cluster0.y2o6ayv.mongodb.net/?appName=Cluster0
PORT=5000

# navalcommander8_db_user
# Vx3COLjCY9yZrFDw

# mongodb+srv://navalcommander8_db_user:Vx3COLjCY9yZrFDw@cluster0.y2o6ayv.mongodb.net/?appName=Cluster0
# mongodb+srv://navalcommander8_db_user:Vx3COLjCY9yZrFDw@cluster0.y2o6ayv.mongodb.net/?appName=Cluster0
<!-- mongodb+srv://navalcommander8_db_user:Vx3COLjCY9yZrFDw@cluster0.y2o6ayv.mongodb.net/?appName=Cluster0 -->

Try changing the preferred dns, and alternate dns:
Preferred: 8.8.8.8
Alternate: 8.8.4.4