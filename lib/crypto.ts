import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"
const ALGORITHM = "aes-256-cbc"

// Ensure the key is exactly 32 bytes for AES-256
function getKey(): Buffer {
  if (ENCRYPTION_KEY.length === 32) {
    return Buffer.from(ENCRYPTION_KEY, "utf8")
  }
  // Hash the key to ensure it's exactly 32 bytes
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest()
}

export function encrypt(text: string): string {
  try {
    const key = getKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption failed:", error)
    throw new Error("Failed to encrypt data")
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const key = getKey()
    const textParts = encryptedText.split(":")

    if (textParts.length !== 2) {
      throw new Error("Invalid encrypted text format")
    }

    const iv = Buffer.from(textParts[0], "hex")
    const encrypted = textParts[1]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("Failed to decrypt data")
  }
}
