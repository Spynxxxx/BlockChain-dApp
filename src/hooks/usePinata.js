const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({ name: file.name });
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

export function ipfsGatewayUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
