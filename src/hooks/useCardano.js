import * as CSL from "@emurgo/cardano-serialization-lib-browser";

const BLOCKFROST_KEY = "previewN4X6fbUhv9PpRgsZq48fVfTcNLcc99tf";
const BLOCKFROST_URL = "https://cardano-preview.blockfrost.io/api/v0";

async function fetchBlockfrost(endpoint) {
  const res = await fetch(`${BLOCKFROST_URL}${endpoint}`, {
    headers: { project_id: BLOCKFROST_KEY },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Blockfrost error ${res.status}`);
  }
  return res.json();
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

export async function sendUploadFee(laceApi, metadata) {
  const usedAddresses = await laceApi.getUsedAddresses();
  const changeAddr = await laceApi.getChangeAddress();
  const toAddress = usedAddresses?.[0] || changeAddr;

  const recipientAddr = toAddress.startsWith("addr")
    ? toAddress
    : CSL.Address.from_hex(toAddress).to_bech32();

  const utxosCbor = await laceApi.getUtxos();
  const ONE_ADA = "1000000";

  const params = await fetchBlockfrost("/epochs/latest/parameters");
  const tip = await fetchBlockfrost("/blocks/latest");
  const coinsPerUtxoByte =
    params.coins_per_utxo_size ?? params.coins_per_utxo_word ?? "4310";

  try {
    const txBuilderCfg = CSL.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CSL.LinearFee.new(
          CSL.BigNum.from_str(String(params.min_fee_a)),
          CSL.BigNum.from_str(String(params.min_fee_b)),
        ),
      )
      .pool_deposit(CSL.BigNum.from_str(String(params.pool_deposit)))
      .key_deposit(CSL.BigNum.from_str(String(params.key_deposit)))
      .max_value_size(Number(params.max_val_size ?? 5000))
      .max_tx_size(Number(params.max_tx_size ?? 16384))
      .coins_per_utxo_byte(CSL.BigNum.from_str(String(coinsPerUtxoByte)))
      .build();

    const txBuilder = CSL.TransactionBuilder.new(txBuilderCfg);

    for (const utxoCbor of utxosCbor) {
      const utxo = CSL.TransactionUnspentOutput.from_hex(utxoCbor);
      txBuilder.add_regular_input(
        utxo.output().address(),
        utxo.input(),
        utxo.output().amount(),
      );
    }

    txBuilder.add_output(
      CSL.TransactionOutput.new(
        CSL.Address.from_bech32(recipientAddr),
        CSL.Value.new(CSL.BigNum.from_str(ONE_ADA)),
      ),
    );

    const generalMetadata = CSL.GeneralTransactionMetadata.new();
    const metadataMap = CSL.MetadataMap.new();

    metadataMap.insert(
      CSL.TransactionMetadatum.new_text("app"),
      CSL.TransactionMetadatum.new_text("ShareEthNotes"),
    );
    metadataMap.insert(
      CSL.TransactionMetadatum.new_text("title"),
      CSL.TransactionMetadatum.new_text(metadata.title.slice(0, 64)),
    );
    metadataMap.insert(
      CSL.TransactionMetadatum.new_text("subject"),
      CSL.TransactionMetadatum.new_text(metadata.subject.slice(0, 64)),
    );
    metadataMap.insert(
      CSL.TransactionMetadatum.new_text("uploader"),
      CSL.TransactionMetadatum.new_text(metadata.uploader.slice(0, 64)),
    );
    metadataMap.insert(
      CSL.TransactionMetadatum.new_text("courseCode"),
      CSL.TransactionMetadatum.new_text(metadata.courseCode.slice(0, 64)),
    );

    generalMetadata.insert(
      CSL.BigNum.from_str("674"),
      CSL.TransactionMetadatum.new_map(metadataMap),
    );

    const auxData = CSL.AuxiliaryData.new();
    auxData.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(auxData);

    txBuilder.set_ttl_bignum(CSL.BigNum.from_str(String(tip.slot + 7200)));

    txBuilder.add_change_if_needed(CSL.Address.from_hex(changeAddr));

    // sign
    const unsignedTx = txBuilder.build_tx();
    const unsignedTxHex = bytesToHex(unsignedTx.to_bytes());
    const witnessHex = await laceApi.signTx(unsignedTxHex, true);

    const signedTx = CSL.Transaction.new(
      unsignedTx.body(),
      CSL.TransactionWitnessSet.from_hex(witnessHex),
      unsignedTx.auxiliary_data(),
    );

    const signedTxHex = bytesToHex(signedTx.to_bytes());

    // submit
    const submitRes = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_KEY,
        "Content-Type": "application/cbor",
      },
      body: hexToBytes(signedTxHex),
    });

    if (!submitRes.ok) {
      const errData = await submitRes.json().catch(() => ({}));
      throw new Error(errData.message || "Transaction submission failed.");
    }

    const txHash = (await submitRes.text()).replace(/"/g, "");
    return txHash;
  } catch (err) {
    console.error("Transaction error:", err);
    throw err;
  }

  // send 1 ADA back to user
  // 1 ADA in lovelace
  txBuilder.add_output(
    CSL.TransactionOutput.new(
      CSL.Address.from_bech32(recipientAddr),
      CSL.Value.new(CSL.BigNum.from_str(ONE_ADA)),
    ),
  );

  const generalMetadata = CSL.GeneralTransactionMetadata.new();
  const metadataMap = CSL.MetadataMap.new();

  metadataMap.insert(
    CSL.TransactionMetadatum.new_text("app"),
    CSL.TransactionMetadatum.new_text("ShareEthNotes"),
  );
  metadataMap.insert(
    CSL.TransactionMetadatum.new_text("title"),
    CSL.TransactionMetadatum.new_text(metadata.title.slice(0, 64)),
  );
  metadataMap.insert(
    CSL.TransactionMetadatum.new_text("subject"),
    CSL.TransactionMetadatum.new_text(metadata.subject.slice(0, 64)),
  );
  metadataMap.insert(
    CSL.TransactionMetadatum.new_text("uploader"),
    CSL.TransactionMetadatum.new_text(metadata.uploader.slice(0, 64)),
  );
  metadataMap.insert(
    CSL.TransactionMetadatum.new_text("courseCode"),
    CSL.TransactionMetadatum.new_text(metadata.courseCode.slice(0, 64)),
  );

  generalMetadata.insert(
    CSL.BigNum.from_str("674"),
    CSL.TransactionMetadatum.new_map(metadataMap),
  );

  const auxData = CSL.AuxiliaryData.new();
  auxData.set_metadata(generalMetadata);
  txBuilder.set_auxiliary_data(auxData);

  txBuilder.set_ttl_bignum(CSL.BigNum.from_str(String(tip.slot + 7200)));

  txBuilder.add_change_if_needed(CSL.Address.from_hex(changeAddr));

  const unsignedTx = txBuilder.build_tx();
  const unsignedTxHex = bytesToHex(unsignedTx.to_bytes());
  const witnessHex = await laceApi.signTx(unsignedTxHex, true);

  const signedTx = CSL.Transaction.new(
    unsignedTx.body(),
    CSL.TransactionWitnessSet.from_hex(witnessHex),
    unsignedTx.auxiliary_data(),
  );

  const signedTxHex = bytesToHex(signedTx.to_bytes());

  const submitRes = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
    method: "POST",
    headers: {
      project_id: BLOCKFROST_KEY,
      "Content-Type": "application/cbor",
    },
    body: hexToBytes(signedTxHex),
  });

  if (!submitRes.ok) {
    const errData = await submitRes.json().catch(() => ({}));
    throw new Error(errData.message || "Transaction submission failed.");
  }

  const txHash = (await submitRes.text()).replace(/"/g, "");
  return txHash;
}
