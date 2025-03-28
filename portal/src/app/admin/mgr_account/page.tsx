"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import AddAccountForm from "@/app/admin/mgr_account/add_acc_form";
import EditAccount from "@/app/admin/mgr_account/edit_acc";

interface User {
  id: number;
  name?: string; // Thêm ? để biến thành optional
  email: string;
  faculties?: string; // Thêm ? để biến thành optional
  role: string;
  password?: string; // Thêm nếu cần
}

const AccountManagerPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Kiet",
      email: "kiet@gmail.com",
      faculties: "IT",
      role: "student",
    },
    {
      id: 2,
      name: "Huy",
      email: "huy@gmail.com",
      faculties: "Graphic",
      role: "student",
    },
    {
      id: 3,
      name: "Hoang",
      email: "Hoang@gmail.com",
      faculties: "Graphic",
      role: "student",
    },
  ]);

  // Add search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for managing the account creation modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  
  // State for managing the edit account modal
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Filter users based on search term - FIX HERE
  const filteredUsers = users.filter(user => 
    user && 
    (user.name ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
    (user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  // Function to handle user deletion
  const deleteUser = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };
  
  // Function to handle user editing
  const editUser = (id: number) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsEditAccountOpen(true);
    }
  };

  // Function to save edited user
  const handleSaveEditedUser = (userId: number, updatedData: { name?: string }) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updatedData } : user
    ));
  };

  // Function to handle creating a new account
  const createAccount = () => {
    setIsAddAccountOpen(true);
  };

  // Function to add a new user from form with name, email, faculties, role
  const handleAddUser = (userData: {
    name?: string;
    email: string;
    faculties?: string;
    role: string;
  }) => {
    // Create a new user with a new ID
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
      ...userData
    };
    
    setUsers([...users, newUser]);
  };

  // Function to handle submissions from add_acc_form (email, password, role)
  const handleAddAccount = (userData: { email: string; password: string; role: string }) => {
    // Đảm bảo userData có đủ các trường cần thiết trước khi thêm vào state
    if (!userData || !userData.email) {
      console.error("Invalid user data received from form");
      return;
    }
    
    // Sau đó thêm vào danh sách users (không phải accounts)
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
      ...userData
    };
    
    setUsers([...users, newUser]);
  };

  // Thay thế đoạn code gọi API hiện tại

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // API endpoint có thể cần điều chỉnh dựa trên cấu trúc backend của bạn
        // Thay thế URL API đúng ở đây
        const response = await fetch("http://localhost:3002/api/v1/auth/all-users", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          }
        });
        
        // Thêm log để debug
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          // Log chi tiết lỗi để debug
          const errorText = await response.text();
          console.error(`API error (${response.status}):`, errorText);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API data received:", data);
        
        // Đảm bảo mỗi item trong mảng có thuộc tính email
        const validUsers = data.filter((user: any) => user && user.email);
        setUsers(validUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Giữ nguyên dữ liệu mẫu nếu API không hoạt động
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Account Manager</h1>

        {/* Search box and Create Account button */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            onClick={createAccount}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            Create Account
          </button>
        </div>

        {/* Add Account Form Modal - Cập nhật handler */}
        <AddAccountForm 
          open={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onSubmit={handleAddAccount} // Đổi từ handleAddUser sang handleAddAccount
          faculties={[
            { id: "1", name: "IT" },
            { id: "2", name: "Graphic" },
            { id: "3", name: "Business" },
          ]}
        />

        {/* Edit Account Modal */}
        {editingUser && (
          <EditAccount
            isOpen={isEditAccountOpen}
            onClose={() => setIsEditAccountOpen(false)}
            onSave={handleSaveEditedUser}
            userId={editingUser.id}
            currentName={editingUser.name || ""}
          />
        )}

        {/* User list table */}
        <div className="border rounded-lg p-4 bg-white text-black">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Faculties</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border p-2">{user.name || "N/A"}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.faculties || "N/A"}</td>
                    <td className="border p-2">{user.role}</td>
                    <td className="border p-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => editUser(user.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          title="Edit user"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {searchTerm ? "No matching users found" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AccountManagerPage;
