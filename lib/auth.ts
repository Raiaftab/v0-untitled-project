import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"

export type User = {
  id: number
  username: string
  name: string
  role: "admin" | "user"
}

export type UserWithPassword = User & {
  password_hash: string
}

// Default users with plain text passwords for direct comparison
// This is a simplified approach for this specific application
const DEFAULT_USERS = [
  {
    id: 1,
    username: "admin",
    name: "Administrator",
    role: "admin" as const,
    password: "admin123", // Plain text for direct comparison
  },
  {
    id: 2,
    username: "user",
    name: "Regular User",
    role: "user" as const,
    password: "user123", // Plain text for direct comparison
  },
]

// Keep track of custom users (those created through the UI)
const CUSTOM_USERS = new Map<string, UserWithPassword>()

// Keep track of the next available user ID
let nextUserId = 3

// Login function that works without database
export async function login(username: string, password: string): Promise<User | null> {
  try {
    console.log("Attempting login for user:", username)

    // First check default users with direct password comparison
    const defaultUser = DEFAULT_USERS.find((user) => user.username === username && user.password === password)

    if (defaultUser) {
      console.log("Default user authenticated:", username)

      // Create session
      const user = {
        id: defaultUser.id,
        username: defaultUser.username,
        name: defaultUser.name,
        role: defaultUser.role,
      }

      await createSession(user)
      return user
    }

    // If not a default user, check custom users
    const customUser = CUSTOM_USERS.get(username)

    if (customUser) {
      // Verify password for custom user
      try {
        const passwordMatch = await bcrypt.compare(password, customUser.password_hash)

        if (passwordMatch) {
          console.log("Custom user authenticated:", username)

          // Create session
          const user = {
            id: customUser.id,
            username: customUser.username,
            name: customUser.name,
            role: customUser.role,
          }

          await createSession(user)
          return user
        }
      } catch (error) {
        console.error("Error comparing passwords:", error)
      }
    }

    console.log("Authentication failed for user:", username)
    return null
  } catch (error) {
    console.error("Error during login:", error)
    throw new Error(`Error during login: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Helper function to create a session
async function createSession(user: User): Promise<void> {
  // Create session ID
  const sessionId = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // Session expires in 7 days

  // Set cookies
  const cookieStore = cookies()

  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  cookieStore.set("user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  cookieStore.set("user_role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  cookieStore.set("user_name", user.name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  cookieStore.set("username", user.username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })

  console.log("Session cookies set for user:", user.username)
}

// Logout function
export async function logout() {
  // Clear all auth cookies
  cookies().delete("session_id")
  cookies().delete("user_id")
  cookies().delete("user_role")
  cookies().delete("user_name")
  cookies().delete("username")
  
  // Don't redirect here, let the caller handle redirection
}

// Get current user from cookies
export async function getCurrentUser(): Promise<User | null> {
  const sessionId = cookies().get("session_id")?.value
  const userId = cookies().get("user_id")?.value
  const userRole = cookies().get("user_role")?.value
  const userName = cookies().get("user_name")?.value
  const username = cookies().get("username")?.value

  if (!sessionId || !userId || !userRole || !userName || !username) {
    return null
  }

  return {
    id: Number.parseInt(userId),
    username: username,
    name: userName,
    role: userRole as "admin" | "user",
  }
}

// Check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

// Check if user is admin
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== "admin") {
    redirect("/")
  }

  return user
}

// Change password function
export async function changePassword(
  username: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if it's a default user
    const defaultUser = DEFAULT_USERS.find((user) => user.username === username)

    if (defaultUser) {
      // Verify current password for default user
      if (defaultUser.password !== currentPassword) {
        return { success: false, message: "Current password is incorrect" }
      }

      // We don't actually change passwords for default users in this simplified implementation
      return { success: true, message: "Password changed successfully" }
    }

    // Check if it's a custom user
    const customUser = CUSTOM_USERS.get(username)

    if (!customUser) {
      return { success: false, message: "User not found" }
    }

    // Verify current password for custom user
    const passwordMatch = await bcrypt.compare(currentPassword, customUser.password_hash)
    if (!passwordMatch) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    CUSTOM_USERS.set(username, {
      ...customUser,
      password_hash: newPasswordHash,
    })

    console.log(`Password changed for user: ${username}`)
    return { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Error changing password:", error)
    return {
      success: false,
      message: `Error changing password: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Get all users (for admin)
export async function getAllUsers(): Promise<User[]> {
  const users: User[] = [
    ...DEFAULT_USERS.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })),
  ]

  // Add custom users
  CUSTOM_USERS.forEach((user) => {
    users.push({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
  })

  return users
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  // Check default users
  const defaultUser = DEFAULT_USERS.find((user) => user.id === id)
  if (defaultUser) {
    return {
      id: defaultUser.id,
      username: defaultUser.username,
      name: defaultUser.name,
      role: defaultUser.role,
    }
  }

  // Check custom users
  let foundUser = null
  CUSTOM_USERS.forEach((user) => {
    if (user.id === id) {
      foundUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      }
    }
  })

  return foundUser
}

// Create new user
export async function createUser(
  username: string,
  password: string,
  name: string,
  role: "admin" | "user",
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // Check if username already exists in default users
    if (DEFAULT_USERS.some((user) => user.username === username)) {
      return { success: false, message: "Username already exists" }
    }

    // Check if username already exists in custom users
    if (CUSTOM_USERS.has(username)) {
      return { success: false, message: "Username already exists" }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create new user
    const newUser: UserWithPassword = {
      id: nextUserId++,
      username,
      name,
      role,
      password_hash: passwordHash,
    }

    // Add to custom users
    CUSTOM_USERS.set(username, newUser)

    console.log(`User created: ${username}`)

    return {
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: `Error creating user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Update user
export async function updateUser(
  id: number,
  updates: { name?: string; role?: "admin" | "user"; password?: string },
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // Check if it's a default user
    const defaultUserIndex = DEFAULT_USERS.findIndex((user) => user.id === id)

    if (defaultUserIndex !== -1) {
      // Prevent updating the last admin
      if (DEFAULT_USERS[defaultUserIndex].role === "admin" && updates.role === "user") {
        // Count admins
        const adminCount =
          DEFAULT_USERS.filter((user) => user.role === "admin").length +
          Array.from(CUSTOM_USERS.values()).filter((user) => user.role === "admin").length

        if (adminCount <= 1) {
          return { success: false, message: "Cannot change role: At least one admin is required" }
        }
      }

      // For default users, we only update in memory (not persistent)
      if (updates.name) {
        DEFAULT_USERS[defaultUserIndex].name = updates.name
      }

      if (updates.role) {
        DEFAULT_USERS[defaultUserIndex].role = updates.role
      }

      // We don't update passwords for default users in this simplified implementation

      return {
        success: true,
        message: "User updated successfully",
        user: {
          id: DEFAULT_USERS[defaultUserIndex].id,
          username: DEFAULT_USERS[defaultUserIndex].username,
          name: DEFAULT_USERS[defaultUserIndex].name,
          role: DEFAULT_USERS[defaultUserIndex].role,
        },
      }
    }

    // Find user in custom users
    let userToUpdate: UserWithPassword | null = null
    let usernameToUpdate: string | null = null

    CUSTOM_USERS.forEach((user, username) => {
      if (user.id === id) {
        userToUpdate = user
        usernameToUpdate = username
      }
    })

    if (!userToUpdate || !usernameToUpdate) {
      return { success: false, message: "User not found" }
    }

    // Prevent updating the last admin
    if (userToUpdate.role === "admin" && updates.role === "user") {
      // Count admins
      const adminCount =
        DEFAULT_USERS.filter((user) => user.role === "admin").length +
        Array.from(CUSTOM_USERS.values()).filter((user) => user.role === "admin").length

      if (adminCount <= 1) {
        return { success: false, message: "Cannot change role: At least one admin is required" }
      }
    }

    // Update user
    const updatedUser = { ...userToUpdate }

    if (updates.name) {
      updatedUser.name = updates.name
    }

    if (updates.role) {
      updatedUser.role = updates.role
    }

    if (updates.password) {
      updatedUser.password_hash = await bcrypt.hash(updates.password, 10)
    }

    // Update in map
    CUSTOM_USERS.set(usernameToUpdate, updatedUser)

    console.log(`User updated: ${usernameToUpdate}`)

    return {
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      success: false,
      message: `Error updating user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Delete user
export async function deleteUser(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Check if it's a default user
    const defaultUserIndex = DEFAULT_USERS.findIndex((user) => user.id === id)

    if (defaultUserIndex !== -1) {
      // Prevent deleting default users
      return { success: false, message: "Cannot delete default users" }
    }

    // Find user in custom users
    let userToDelete: UserWithPassword | null = null
    let usernameToDelete: string | null = null

    CUSTOM_USERS.forEach((user, username) => {
      if (user.id === id) {
        userToDelete = user
        usernameToDelete = username
      }
    })

    if (!userToDelete || !usernameToDelete) {
      return { success: false, message: "User not found" }
    }

    // Prevent deleting the last admin
    if (userToDelete.role === "admin") {
      // Count admins
      const adminCount =
        DEFAULT_USERS.filter((user) => user.role === "admin").length +
        Array.from(CUSTOM_USERS.values()).filter((user) => user.role === "admin").length

      if (adminCount <= 1) {
        return { success: false, message: "Cannot delete: At least one admin is required" }
      }
    }

    // Delete from map
    CUSTOM_USERS.delete(usernameToDelete)

    console.log(`User deleted: ${usernameToDelete}`)

    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      message: `Error deleting user: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
