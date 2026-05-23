# To Run this application

First Step:
New Terminal: cd BlockChain-dApp (or your folder name)
--
npm install
npm run dev
--

Second:

- create a .env file in the main folder:
  and add this:
  --
  VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxOTI3N2RlNC00MmY4LTRiOTgtYjYxYy03OGQwMTI3MzJmNTAiLCJlbWFpbCI6Im5hdmFsY29tbWFuZGVyOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODFlNzU5MThjZDcxNjY2ZjViMGIiLCJzY29wZWRLZXlTZWNyZXQiOiI1ZTBiMTA2MTQ5MzdkYzhkNTExMDE1ZWYwNjZhMWYwODAxZjY4NmU4ZjdlNDM5NWVjYWI4MTYyYjJkYzNhZTI2IiwiZXhwIjoxODEwOTE4MDAxfQ.86uJc4kjeP3VyZUMcziPOn_KszMhAPWa7Xxy1M4NSJE
  VITE_API_URL=https://blockchain-dapp-59to.onrender.com
  --

UPDATES:
nig send sa file mag need ug 1 ada but it only sends it to yourself (just to create a transaction in the blockchain) - done
implement the My Notes - done
implement search Feature - done
if mo send ug file na na upload kay dile na ka upload(issue) - fixed
delete files - done

Run the app before the presentation:
The only thing to note is that Render's free tier "spins down" after 15 minutes of inactivity — meaning the first request after inactivity takes about 30-50 seconds to wake up. After that it's fast again. For a school presentation just open the app a minute before you demo so it's warmed up!

dApp (ShareEth) Description:
ShareEtH is a student-focused platform that allows users to upload, store, and download academic materials such as PDF, images, lecture slides, and documents using a decentralized storage system like IPFS.

Detailed Description:
Our app lets you connect your wallet to authorize access, to allow upload, download, and even delete (your own file). Registering is the first thing to do when opening or application, it asks for you username and for the course-code. Course code is to filter the files uploaded by the users to only retrieve the file under certain courses. When uploading a file our dApp requires 1 ADA to upload a file, but no worries since that 1 ADA is going to your wallet just to show that our application uploaded a file to the blockchain.
