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
      fileType: file.type,
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.details || "Pinata upload failed");
  }

  const data = await res.json();
  return data.IpfsHash; // this is the CID
}

export async function getFilesFromPinata() {
  const res = await fetch(
    "https://api.pinata.cloud/data/pinList?status=pinned",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch files from Pinata");
  }

  const data = await res.json();

  return data.rows;
}

export function ipfsGatewayUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
