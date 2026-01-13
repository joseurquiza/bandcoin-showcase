"use server"

import { neon } from "@neondatabase/serverless"
import { getWalletConnection } from "@/app/rewards/rewards-actions"

const sql = neon(process.env.DATABASE_URL!)

export async function getOrCreateDirectRoom(otherWalletAddress: string) {
  const connection = await getWalletConnection()
  if (!connection?.address) {
    return { success: false, error: "Wallet not connected" }
  }

  const myAddress = connection.address

  // Check if room already exists between these two users
  const existingRoom = await sql`
    SELECT DISTINCT r.* 
    FROM chat_rooms r
    INNER JOIN chat_participants p1 ON r.id = p1.room_id
    INNER JOIN chat_participants p2 ON r.id = p2.room_id
    WHERE r.room_type = 'direct'
    AND p1.wallet_address = ${myAddress}
    AND p2.wallet_address = ${otherWalletAddress}
  `

  if (existingRoom.length > 0) {
    return { success: true, roomId: existingRoom[0].id }
  }

  // Create new room
  const newRoom = await sql`
    INSERT INTO chat_rooms (room_type, created_by)
    VALUES ('direct', ${myAddress})
    RETURNING id
  `

  const roomId = newRoom[0].id

  // Add both participants
  await sql`
    INSERT INTO chat_participants (room_id, wallet_address)
    VALUES (${roomId}, ${myAddress}), (${roomId}, ${otherWalletAddress})
  `

  return { success: true, roomId }
}

export async function sendMessage(roomId: number, message: string) {
  const connection = await getWalletConnection()
  if (!connection?.address) {
    return { success: false, error: "Wallet not connected" }
  }

  // Verify user is participant
  const isParticipant = await sql`
    SELECT * FROM chat_participants
    WHERE room_id = ${roomId} AND wallet_address = ${connection.address}
  `

  if (isParticipant.length === 0) {
    return { success: false, error: "Not authorized" }
  }

  // Insert message
  await sql`
    INSERT INTO chat_messages (room_id, sender_wallet, message)
    VALUES (${roomId}, ${connection.address}, ${message})
  `

  // Update room last_message_at
  await sql`
    UPDATE chat_rooms
    SET last_message_at = NOW()
    WHERE id = ${roomId}
  `

  return { success: true }
}

export async function getMyRooms() {
  const connection = await getWalletConnection()
  if (!connection?.address) {
    return []
  }

  const rooms = await sql`
    SELECT 
      r.*,
      (
        SELECT COUNT(*)
        FROM chat_messages m
        WHERE m.room_id = r.id 
        AND m.created_at > COALESCE(p.last_read_at, '1970-01-01')
        AND m.sender_wallet != ${connection.address}
      ) as unread_count,
      (
        SELECT m.message
        FROM chat_messages m
        WHERE m.room_id = r.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) as last_message,
      (
        SELECT p2.wallet_address
        FROM chat_participants p2
        WHERE p2.room_id = r.id AND p2.wallet_address != ${connection.address}
        LIMIT 1
      ) as other_wallet
    FROM chat_rooms r
    INNER JOIN chat_participants p ON r.id = p.room_id
    WHERE p.wallet_address = ${connection.address}
    ORDER BY r.last_message_at DESC
  `

  return rooms.map((room) => ({
    ...room,
    unread_count: Number.parseInt(room.unread_count),
    last_message_at: room.last_message_at ? new Date(room.last_message_at).toISOString() : null,
  }))
}

export async function getRoomMessages(roomId: number, limit = 50) {
  const connection = await getWalletConnection()
  if (!connection?.address) {
    return []
  }

  // Verify user is participant
  const isParticipant = await sql`
    SELECT * FROM chat_participants
    WHERE room_id = ${roomId} AND wallet_address = ${connection.address}
  `

  if (isParticipant.length === 0) {
    return []
  }

  // Mark as read
  await sql`
    UPDATE chat_participants
    SET last_read_at = NOW()
    WHERE room_id = ${roomId} AND wallet_address = ${connection.address}
  `

  const messages = await sql`
    SELECT *
    FROM chat_messages
    WHERE room_id = ${roomId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `

  return messages.reverse().map((msg) => ({
    ...msg,
    created_at: new Date(msg.created_at).toISOString(),
    isMine: msg.sender_wallet === connection.address,
  }))
}

export async function searchUsers(query: string) {
  if (!query || query.length < 2) {
    return []
  }

  // Search in reward_users for connected users
  const users = await sql`
    SELECT DISTINCT stellar_address, display_name
    FROM reward_users
    WHERE stellar_address IS NOT NULL
    AND (
      stellar_address ILIKE ${`%${query}%`}
      OR display_name ILIKE ${`%${query}%`}
    )
    LIMIT 10
  `

  return users.filter((u) => u.stellar_address !== null)
}
