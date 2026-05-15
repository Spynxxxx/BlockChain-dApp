const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
export async function uploadToIPFS(file, metadataData) {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      title: metadataData.title,
      subject: metadataData.subject,
      description: metadataData.description,
      uploader: metadataData.uploader,
      courseCode: metadataData.courseCode,
      fileType: file.type,
      type: "file",
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.details || "Pinata upload failed");
  }

  const data = await res.json();
  return data.IpfsHash;
}

export async function registerUser(walletAddress, courseCode) {
  const formData = new FormData();

  const blob = new Blob(["x"], { type: "text/plain" });
  formData.append("file", blob, "user_registration.txt");

  const metadata = JSON.stringify({
    name: `user_${walletAddress}`,
    keyvalues: {
      type: "user",
      walletAddress: walletAddress,
      courseCode: courseCode,
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.details || "Failed to register user");
  }

  return await res.json();
}
export async function getUserCourseCode(walletAddress) {
  const res = await fetch(
    `https://api.pinata.cloud/data/pinList?status=pinned` +
      `&metadata[keyvalues][type]={"value":"user","op":"eq"}` +
      `&metadata[keyvalues][walletAddress]={"value":"${walletAddress}","op":"eq"}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user from Pinata");
  }

  const data = await res.json();

  if (data.rows && data.rows.length > 0) {
    return data.rows[0].metadata?.keyvalues?.courseCode || null;
  }

  return null;
}
export async function getFilesFromPinata(courseCode) {
  let url =
    `https://api.pinata.cloud/data/pinList?status=pinned` +
    `&metadata[keyvalues][type]={"value":"file","op":"eq"}`;

  if (courseCode) {
    url += `&metadata[keyvalues][courseCode]={"value":"${courseCode}","op":"eq"}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch files from Pinata");
  }

  const data = await res.json();
  return data.rows;
}

export function ipfsGatewayUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
