import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, MessageCircle, Search, Send, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getMessagedUsers,
  getMessages,
  sendMessage,
  upsertMessagedUser,
} from "../store/messageSlice";
import { getUserInfo } from "../store/userSlice";

const getAvatarUrl = (user) =>
  user?.profileImage?.thumbnail || user?.profileImage?.url || "";

const getInitial = (name) => (name || "U").slice(0, 1).toUpperCase();

const normalizeId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return value._id?.toString?.() || value.toString?.() || "";
  }

  return value.toString();
};

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { messages, messagedUsers, loading, conversationsLoading, error } =
    useSelector((state) => state.messageReducer);
  const { userInfo } = useSelector((state) => state.userReducer);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialRecipientHandledRef = useRef(false);
  const initialRecipient = useMemo(() => {
    const recipientUserId = normalizeId(location.state?.recipientUserId);

    if (!recipientUserId) {
      return null;
    }

    return {
      _id: recipientUserId,
      name: location.state.recipientName || "Restaurant",
      profileImage: location.state.recipientProfileImage,
    };
  }, [location.state]);

  useEffect(() => {
    if (!userInfo) {
      dispatch(getUserInfo());
    }
    dispatch(getMessagedUsers());
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (!initialRecipient?._id || initialRecipientHandledRef.current) {
      return;
    }

    initialRecipientHandledRef.current = true;
    setSelectedUserId(normalizeId(initialRecipient._id));
    dispatch(upsertMessagedUser(initialRecipient));
    dispatch(getMessages(normalizeId(initialRecipient._id)));
  }, [dispatch, initialRecipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const selectedUser = useMemo(
    () =>
      messagedUsers.find(
        (item) => String(item._id) === String(selectedUserId),
      ) ||
      (String(initialRecipient?._id) === String(selectedUserId)
        ? initialRecipient
        : null),
    [initialRecipient, messagedUsers, selectedUserId],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return messagedUsers;
    }

    return messagedUsers.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const id = String(item._id || "").toLowerCase();
      return name.includes(query) || id.includes(query);
    });
  }, [search, messagedUsers]);

  const activeChatLabel =
    selectedUser?.name ||
    (selectedUserId ? "New conversation" : "Select a chat");
  const canSend = selectedUserId && (text.trim() || image);

  const handleSelectUser = async (nextUserId) => {
    if (!nextUserId) {
      return;
    }

    const recipientUserId = normalizeId(nextUserId);
    setSelectedUserId(recipientUserId);
    await dispatch(getMessages(recipientUserId));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!canSend) {
      return;
    }

    const result = await dispatch(
      sendMessage({
        userId: normalizeId(selectedUserId),
        text: text.trim(),
        image,
      }),
    );

    if (result?.meta?.requestStatus === "fulfilled") {
      setText("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (selectedUser) {
        dispatch(
          upsertMessagedUser({
            ...selectedUser,
            latestMessageAt:
              result.payload?.createdAt || new Date().toISOString(),
          }),
        );
      }
      dispatch(getMessagedUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--accent)">
          Direct coordination
        </p>
        <h2 className="mt-2 font-display text-3xl">Messages</h2>
        <p className="text-sm text-(--muted)">
          Chat with restaurants, NGOs, and volunteers from one pickup-ready
          inbox.
        </p>
      </div>

      <div className="glass-panel grid overflow-hidden rounded-[36px] border border-white/70 lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-white/70 bg-white/55 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl">Inbox</h3>
              <p className="text-xs text-(--muted)">
                {messagedUsers.length} conversations
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(getMessagedUsers())}
              disabled={conversationsLoading}
              className="rounded-full border border-(--accent-2) px-3 py-1.5 text-xs font-semibold text-(--accent-2) disabled:opacity-60"
            >
              {conversationsLoading ? "Loading" : "Refresh"}
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-3">
            <Search className="h-4 w-4 text-(--muted)" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent text-sm outline-none placeholder:text-(--muted)"
            />
          </div>

          <div className="mt-5 max-h-130 space-y-2 overflow-auto pr-1">
            {filteredUsers.map((item) => {
              const avatarUrl = getAvatarUrl(item);
              const isActive = String(selectedUserId) === String(item._id);

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleSelectUser(item._id)}
                  className={`flex w-full items-center gap-3 rounded-[26px] px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-(--accent-2) text-white shadow-lg shadow-orange-200"
                      : "bg-white/70 text-(--ink) hover:bg-white"
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={item.name || "Conversation"}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/80"
                    />
                  ) : (
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-full font-semibold ring-2 ring-white/80 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-(--accent)/10 text-(--accent)"
                      }`}
                    >
                      {getInitial(item.name)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.name || "User"}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        isActive ? "text-white/75" : "text-(--muted)"
                      }`}
                    >
                      {item.latestMessageAt
                        ? new Date(item.latestMessageAt).toLocaleString()
                        : "Tap to open chat"}
                    </span>
                  </span>
                </button>
              );
            })}

            {!filteredUsers.length && (
              <div className="rounded-[26px] bg-white/70 p-5 text-sm text-(--muted)">
                No chats found yet. Conversations will appear here after a
                message exists.
              </div>
            )}
          </div>
        </aside>

        <section className="flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,122,26,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,248,241,0.72))]">
          <div className="flex items-center gap-3 border-b border-white/70 bg-white/65 px-5 py-4 backdrop-blur">
            {selectedUser ? (
              getAvatarUrl(selectedUser) ? (
                <img
                  src={getAvatarUrl(selectedUser)}
                  alt={selectedUser.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-(--accent)/10 font-semibold text-(--accent)">
                  {getInitial(selectedUser.name)}
                </span>
              )
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-(--accent-2)/10 text-(--accent-2)">
                <MessageCircle className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-display text-xl">
                {activeChatLabel}
              </h3>
              <p className="truncate text-xs text-(--muted)">
                {selectedUserId ? null : "Pick a conversation to begin"}
              </p>
            </div>
          </div>
          {/* close chat button */}
          {selectedUserId && (
            <button
              type="button"
              onClick={() => setSelectedUserId("")}
              className="absolute right-6 top-6 rounded-full bg-white/80 p-1 text-(--muted) transition hover:bg-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          )}


          <div className=" max-h-160 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            {selectedUserId ? (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isMine =
                    String(message.senderId) === String(userInfo?._id);

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-[28px] px-4 py-3 shadow-sm sm:max-w-[66%] ${
                          isMine
                            ? "rounded-br-md bg-(--accent-2) text-white"
                            : "rounded-bl-md bg-white text-(--ink) "
                        }`}
                      >
                        {message.text ? (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {message.text}
                          </p>
                        ) : null}
                        {message.image?.url ? (
                          <img
                            src={message.image.url}
                            alt="Message attachment"
                            className="mt-3 max-h-80 w-full rounded-2xl object-cover"
                          />
                        ) : null}
                        <p
                          className={`mt-2 text-[10px] ${
                            isMine ? "text-white/70" : "text-(--muted)"
                          }`}
                        >
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!messages.length && (
                  <div className="mx-auto mt-20 max-w-sm rounded-4xl bg-white/70 p-8 text-center">
                    <MessageCircle className="mx-auto h-10 w-10 text-(--accent)" />
                    <h4 className="mt-4 font-display text-xl">
                      No messages yet
                    </h4>
                    <p className="mt-2 text-sm text-(--muted)">
                      Send the first note and get this pickup thread moving.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="grid h-full place-items-center">
                <div className="max-w-sm rounded-[36px] bg-white/70 p-8 text-center shadow-sm">
                  <MessageCircle className="mx-auto h-12 w-12 text-(--accent-2)" />
                  <h4 className="mt-4 font-display text-2xl">
                    Your pickup chats live here
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-(--muted)">
                    Select a conversation from the inbox to continue
                    coordinating.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-white/70 bg-white/70 p-4 backdrop-blur"
          >
            {image ? (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-(--muted)">
                <ImagePlus className="h-4 w-4 text-(--accent)" />
                {image.name}
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded-full bg-red-50 p-1 text-red-500"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            <div className="flex items-end gap-2 rounded-[30px] border px-3 py-2 shadow-sm  border-orange-100 bg-white p-4 text-sm  ring-1 ring-orange-50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedUserId}
                className="grid h-10 w-10 place-items-center rounded-full text-(--accent) transition hover:bg-(--accent)/10 disabled:opacity-40"
                aria-label="Attach image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <textarea
                rows="1"
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend(event);
                  }
                }}
                disabled={!selectedUserId}
                placeholder={
                  selectedUserId
                    ? "Message..."
                    : "Select a conversation to start messaging"
                }
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 outline-none placeholder:text-(--muted) disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !canSend}
                className="grid h-10 w-10 place-items-center rounded-full bg-(--accent-2) text-white transition hover:scale-105 disabled:scale-100 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {error ? (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Messages;
