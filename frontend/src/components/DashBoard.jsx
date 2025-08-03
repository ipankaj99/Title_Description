import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function DashBoard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [value, setValue] = useState([]);
  const [image, setImagePath] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-post", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setValue(data.posts);
          setImagePath(data.profilePic);
        } else {
          setServerError("Something went wrong, try again later");
        }
      } catch (err) {
        setServerError("Network error. Please try again.");
      }
    };

    fetchPost();
  }, []);

  async function onSubmit(data) {
    try {
      setServerError("");
      setSuccessMessage("");

      const response = await fetch("http://localhost:5000/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setValue((prev) => [...prev, result.post]);
        setSuccessMessage("✅ Post added successfully!");
        reset();
      } else {
        setServerError(result.message || "Failed to add new post.");
      }
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    }
  }

  async function logout() {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        alert(data.message || "Failed to logout");
      }
    } catch (err) {
      alert("Logout failed. Please try again.");
    }
  }

  async function removePost(id) {
    try {
      const response = await fetch(`http://localhost:5000/post/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setValue((prev) => prev.filter((post) => post._id !== id));
      } else {
        console.log(data.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/editPost/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      const data = await response.json();

      if (response.ok) {
      setValue(prev => 
  prev.map((item) =>
    item._id === editId
      ? { ...item, title: editTitle, description: editDescription }
      : item
  )
);

        setEditId(null);
        setEditTitle("");
        setEditDescription("");
      } else {
        console.log(data.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 px-4 py-6 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center mt-4 mb-8">
        {image && (
          <img
            src={`http://localhost:5000${image}`}
            alt="User Profile"
            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-3xl shadow-2xl space-y-6 border border-blue-100"
        >
          <h2 className="text-3xl font-bold text-blue-800 text-center">Create New Post</h2>

          {serverError && <p className="text-red-600 text-center font-medium">❌ {serverError}</p>}
          {successMessage && <p className="text-green-600 text-center font-medium">🎉 {successMessage}</p>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={5}
              {...register("description", { required: "Description is required" })}
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Post"}
          </button>
        </form>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-blue-800">Your Posts</h3>

          {value.length === 0 ? (
            <p className="text-gray-600 text-center bg-white p-6 rounded-xl shadow">
              No posts yet. Your submitted posts will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {value.map((post) => (
                <div key={post._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transition hover:shadow-lg">
                  {editId === post._id ? (
                    <form onSubmit={handleEditSubmit} className="space-y-3">
                      <label className="block text-sm font-semibold">Edit Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      <label className="block text-sm font-semibold">Edit Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                      ></textarea>
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setEditId(null)} className="text-gray-500">Cancel</button>
                        <button type="submit" className="text-green-600">Save</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h4>
                      <p className="text-gray-600 mb-3">{post.description}</p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(post._id);
                            setEditTitle(post.title);
                            setEditDescription(post.description);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removePost(post._id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashBoard;