import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase"; // Firebase設定ファイルのインポート
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth"; // ログイン/ログアウト/ユーザー作成用のインポート

const App = () => {
  const [todos, setTodos] = useState([]); // ToDoリスト状態
  const [input, setInput] = useState(""); // 入力状態
  const [email, setEmail] = useState(""); // メール状態
  const [password, setPassword] = useState(""); // パスワード状態
  const [user, setUser] = useState(null); // ログイン中のユーザー
  const [isRegistering, setIsRegistering] = useState(false); // 登録モードかどうかを管理

  const todoCollection = collection(db, "todos"); // Firestoreのコレクション参照

  // FirestoreからToDoリストを取得する関数
  const fetchTodos = async () => {
    try {
      const querySnapshot = await getDocs(todoCollection);
      setTodos(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      ); // ドキュメントIDを含めたデータ構造に変換
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  // 新しいToDoをFirestoreに追加する関数
  const addTodo = async () => {
    if (input.trim() === "") return; // 空白チェック
    try {
      await addDoc(todoCollection, { text: input }); // Firestoreにデータを追加
      setInput(""); // 入力フィールドをリセット
      fetchTodos(); // Firestoreから最新のデータを取得
    } catch (error) {
      console.error("Error adding todo: ", error);
    }
  };

  // ToDoをFirestoreから削除する関数
  const deleteTodo = async (id) => {
    const todoDoc = doc(db, "todos", id); // Firestoreドキュメントを参照
    try {
      await deleteDoc(todoDoc); // ドキュメントを削除
      fetchTodos(); // Firestoreから最新のデータを取得
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  // ユーザーのログイン
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  // ユーザーの新規登録
  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsRegistering(false); // 登録後、ログイン画面に戻す
    } catch (error) {
      console.error("Error registering: ", error);
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // ログイン状態の監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTodos(); // ユーザーがログインしたらToDoを取得
      }
    });
    return unsubscribe; // クリーンアップ
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Firebase ToDo List</h1>

      {/* ログイン・登録フォーム */}
      {!user ? (
        <div>
          {!isRegistering ? (
            <>
              <h2>Login</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{ marginRight: "10px" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ marginRight: "10px" }}
              />
              <button onClick={login}>Login</button>
              <button onClick={() => setIsRegistering(true)}>
                Sign Up
              </button>{" "}
              {/* 登録フォームへ切り替え */}
            </>
          ) : (
            <>
              <h2>Sign Up</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{ marginRight: "10px" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ marginRight: "10px" }}
              />
              <button onClick={register}>Register</button>
              <button onClick={() => setIsRegistering(false)}>
                Back to Login
              </button>{" "}
              {/* ログインフォームに戻る */}
            </>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome, {user.email}</h2>
          <button onClick={logout}>Logout</button>
          <div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task"
              style={{ marginRight: "10px" }}
            />
            <button onClick={addTodo}>Add</button>
          </div>
          <ul style={{ marginTop: "20px" }}>
            {todos.map((todo) => (
              <li key={todo.id} style={{ marginBottom: "10px" }}>
                {todo.text}{" "}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
