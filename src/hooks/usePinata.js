const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadToIPFS(file, metadataData) {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `${file.name}_${Date.now()}`,
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

  // makes a duplicate file in a folder to allow reupload
  const options = JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: true,
  });
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
  return `${data.IpfsHash}/${file.name}`;
}

export async function getFilesFromPinata(courseCode) {
  let url =
    `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000` +
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
export async function getMyUploads(username) {
  const url =
    `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000` +
    `&metadata[keyvalues][type]={"value":"file","op":"eq"}` +
    `&metadata[keyvalues][uploader]={"value":"${username}","op":"eq"}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });

  if (!res.ok) throw new Error("Failed to fetch your uploads");

  const data = await res.json();
  return data.rows;
}

export async function unpinFile(ipfsHash) {
  // delete file
  const cid = ipfsHash.split("/")[0];

  const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete file");
  }

  return true;
}

export function ipfsGatewayUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
