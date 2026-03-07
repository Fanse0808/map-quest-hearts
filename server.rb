#!/usr/bin/env ruby
# frozen_string_literal: true

require "digest"
require "fileutils"
require "json"
require "securerandom"
require "sqlite3"
require "time"
require "webrick"

ROOT_DIR = File.expand_path(__dir__)
DB_PATH = ENV["DB_PATH"] || File.join(ROOT_DIR, "db", "app.db")
UPLOAD_DIR = ENV["UPLOAD_DIR"] || File.join(ROOT_DIR, "uploads")
BIND_ADDRESS = ENV.fetch("BIND_ADDRESS", "0.0.0.0")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14
MAX_UPLOAD_BYTES = begin
  Integer(ENV.fetch("MAX_UPLOAD_BYTES", (5 * 1024 * 1024).to_s))
rescue StandardError
  5 * 1024 * 1024
end

DEFAULT_GAME_DATA = {
  "settings" => {
    "startHearts" => 3,
    "maxHearts" => 5,
    "endingTitle" => "Congratulations, My Love",
    "endingLetter" => "You made it all the way to the end of our special anniversary journey.\n\nEvery stop on this map holds a memory, but the best part of every trip is still getting to share it with you.\n\nThank you for the laughter, the softness, the patience, and the love that made this story ours.\n\nHappy Anniversary.\n\nWith all my love,"
  },
  "map" => {
    "title" => "Our Special Anniversary Journey",
    "backgroundType" => "gradient",
    "backgroundValue" => "linear-gradient(135deg, #f7d5c6, #f8ecd3 40%, #d8ede4 100%)",
    "imageUrl" => "",
    "showGrid" => true,
    "nodes" => [
      { "id" => "node-1", "levelId" => 1, "label" => "THL", "x" => 10, "y" => 78 },
      { "id" => "node-2", "levelId" => 2, "label" => "BKK", "x" => 28, "y" => 60 },
      { "id" => "node-3", "levelId" => 3, "label" => "KYA", "x" => 46, "y" => 72 },
      { "id" => "node-4", "levelId" => 4, "label" => "RYG", "x" => 68, "y" => 54 },
      { "id" => "node-5", "levelId" => 5, "label" => "KLW", "x" => 84, "y" => 34 },
      { "id" => "node-6", "levelId" => 6, "label" => "YGN", "x" => 56, "y" => 18 },
      { "id" => "node-7", "levelId" => 7, "label" => "NPT", "x" => 28, "y" => 26 }
    ]
  },
  "characters" => [
    {
      "id" => "char-1",
      "name" => "Nova",
      "role" => "player",
      "shape" => "circle",
      "color" => "#ef7f3b",
      "size" => 48,
      "x" => 14,
      "y" => 79,
      "imageUrl" => ""
    },
    {
      "id" => "char-2",
      "name" => "Moss",
      "role" => "npc",
      "shape" => "square",
      "color" => "#3fb39e",
      "size" => 40,
      "x" => 18,
      "y" => 85,
      "imageUrl" => ""
    }
  ],
  "levels" => [
    {
      "id" => 1,
      "title" => "Thanlyin - Japanese Hotel",
      "question" => "What makes the first stop of an anniversary trip feel special?",
      "options" => ["Being there together", "Checking in quickly", "Finding the biggest room", "Taking separate photos"],
      "answerIndex" => 0,
      "explanation" => "The place matters, but sharing the moment together matters more.",
      "arrivalMode" => "Pink Leapmotor T03 into Thanlyin",
      "travelMode" => "Plane to Bangkok"
    },
    {
      "id" => 2,
      "title" => "Bangkok - City Hotel",
      "question" => "What keeps a busy city stop romantic?",
      "options" => ["Sharing the night together", "Rushing through the schedule", "Splitting up all evening", "Talking only about traffic"],
      "answerIndex" => 0,
      "explanation" => "Even in a busy city, the best part is still being together.",
      "arrivalMode" => "Arrive by plane",
      "travelMode" => "Nissan Kicks to Khao Yai"
    },
    {
      "id" => 3,
      "title" => "Khao Yai - Castle",
      "question" => "What turns a castle stay into a real memory?",
      "options" => ["A quiet moment together", "A packed timetable", "Racing to the next stop", "Ignoring the view"],
      "answerIndex" => 0,
      "explanation" => "A beautiful place becomes unforgettable when the two of you slow down and share it.",
      "arrivalMode" => "Arrive by Nissan Kicks",
      "travelMode" => "Nissan Kicks to Rayong"
    },
    {
      "id" => 4,
      "title" => "Rayong - Beach Resort",
      "question" => "What belongs in a perfect beach-resort day?",
      "options" => ["Slow time together", "Work emails", "A tight deadline", "A noisy argument"],
      "answerIndex" => 0,
      "explanation" => "The best beach days are the ones where you can slow down and just enjoy each other.",
      "arrivalMode" => "Arrive by Nissan Kicks",
      "travelMode" => "Black Toyota bZ4X to Kalaw"
    },
    {
      "id" => 5,
      "title" => "Kalaw - Small Townhouse",
      "question" => "What makes a small townhouse feel warm and full of love?",
      "options" => ["The person you share it with", "The size of the windows", "The number of rooms", "The street outside"],
      "answerIndex" => 0,
      "explanation" => "The feeling of home comes from who is beside you.",
      "arrivalMode" => "Arrive by black Toyota bZ4X",
      "travelMode" => "Train to Yangon"
    },
    {
      "id" => 6,
      "title" => "Yangon - Golden Pagoda",
      "question" => "What matters most at a beautiful stop like this?",
      "options" => ["Making the memory together", "Counting every step", "Leaving as fast as possible", "Checking the time the whole way"],
      "answerIndex" => 0,
      "explanation" => "The memory matters more than the rush around it.",
      "arrivalMode" => "Arrive by train",
      "travelMode" => "Same train to Naypyidaw"
    },
    {
      "id" => 7,
      "title" => "Naypyidaw - Government Building",
      "question" => "What is the best ending to this anniversary journey?",
      "options" => ["Choosing each other again", "Going separate ways", "Skipping the final moment", "Forgetting the memories"],
      "answerIndex" => 0,
      "explanation" => "The best ending is always choosing the love story again.",
      "arrivalMode" => "Arrive by the same train",
      "travelMode" => ""
    }
  ]
}.freeze

DEFAULT_ADMIN_USERNAME = ENV.fetch("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = ENV.fetch("DEFAULT_ADMIN_PASSWORD", "admin123")


def iso_now
  Time.now.utc.iso8601
end


def bool_value(value)
  value == true || value == "true" || value == 1 || value == "1"
end


def clamp(value, min, max)
  [[value, min].max, max].min
end


def coerce_int(value, fallback)
  Integer(value)
rescue StandardError
  fallback
end


def text_value(value, fallback = "")
  text = value.to_s.strip
  text.empty? ? fallback : text
end


def deep_clone(value)
  JSON.parse(JSON.generate(value))
end


def levels_signature(levels)
  levels.map { |level| level["id"].to_s }.join("|")
end


def auto_layout_nodes(count)
  cols = [count, 6].min
  rows = (count.to_f / cols).ceil
  x_step = 100.0 / (cols + 1)
  y_step = 70.0 / (rows + 1)

  (0...count).map do |i|
    row = i / cols
    col = i % cols
    direction = row.even? ? col : cols - 1 - col
    x = clamp((direction + 1) * x_step, 2, 98)
    y = clamp(15 + (row + 1) * y_step, 5, 95)

    {
      "id" => "node-#{i + 1}",
      "levelId" => i + 1,
      "label" => (i + 1).to_s,
      "x" => x.round(2),
      "y" => y.round(2)
    }
  end
end


def normalize_levels(raw_levels)
  levels = []
  source = raw_levels.is_a?(Array) ? raw_levels : []

  source.each_with_index do |item, index|
    next unless item.is_a?(Hash)

    options = item["options"].is_a?(Array) ? item["options"].map { |opt| text_value(opt) }.reject(&:empty?) : []
    options = ["Option A", "Option B"] if options.length < 2

    answer_index = clamp(coerce_int(item["answerIndex"], 0), 0, options.length - 1)

    levels << {
      "id" => coerce_int(item["id"], index + 1),
      "title" => text_value(item["title"], "Level #{index + 1}"),
      "question" => text_value(item["question"], "New question"),
      "options" => options,
      "answerIndex" => answer_index,
      "explanation" => text_value(item["explanation"], ""),
      "arrivalMode" => text_value(item["arrivalMode"], ""),
      "travelMode" => text_value(item["travelMode"], "")
    }
  end

  levels = deep_clone(DEFAULT_GAME_DATA["levels"]) if levels.empty?
  levels.each_with_index { |level, idx| level["id"] = idx + 1 }
  levels
end


def normalize_nodes(raw_nodes, levels)
  nodes = raw_nodes.is_a?(Array) ? raw_nodes.select { |node| node.is_a?(Hash) } : []
  generated = auto_layout_nodes(levels.length)

  if nodes.length < levels.length
    ((levels.length - nodes.length)).times do |offset|
      nodes << generated[nodes.length + offset]
    end
  end

  nodes = nodes.take(levels.length)

  nodes.each_with_index.map do |node, index|
    {
      "id" => text_value(node["id"], "node-#{index + 1}"),
      "levelId" => coerce_int(node["levelId"], levels[index]["id"]),
      "label" => text_value(node["label"], (index + 1).to_s),
      "x" => clamp(node["x"].to_f, 2, 98),
      "y" => clamp(node["y"].to_f, 5, 95)
    }
  end
end


def normalize_characters(raw_characters)
  characters = raw_characters.is_a?(Array) ? raw_characters.select { |char| char.is_a?(Hash) } : []
  characters = deep_clone(DEFAULT_GAME_DATA["characters"]) if characters.empty?

  normalized = characters.each_with_index.map do |character, index|
    {
      "id" => text_value(character["id"], "char-#{index + 1}"),
      "name" => text_value(character["name"], "Character #{index + 1}"),
      "role" => character["role"].to_s == "player" ? "player" : "npc",
      "shape" => character["shape"].to_s == "square" ? "square" : "circle",
      "color" => text_value(character["color"], "#ef7f3b"),
      "size" => clamp(coerce_int(character["size"], 44), 24, 90),
      "x" => clamp(character["x"].to_f, 2, 98),
      "y" => clamp(character["y"].to_f, 2, 98),
      "imageUrl" => text_value(character["imageUrl"], "")
    }
  end

  unless normalized.any? { |character| character["role"] == "player" }
    normalized[0]["role"] = "player"
  end

  normalized
end


def normalize_game_data(raw)
  return deep_clone(DEFAULT_GAME_DATA) unless raw.is_a?(Hash)

  levels = normalize_levels(raw["levels"])

  map_source = raw["map"].is_a?(Hash) ? raw["map"] : {}
  settings_source = raw["settings"].is_a?(Hash) ? raw["settings"] : {}

  max_hearts = clamp(coerce_int(settings_source["maxHearts"], 5), 1, 5)
  start_hearts = clamp(coerce_int(settings_source["startHearts"], 3), 1, max_hearts)

  {
    "settings" => {
      "startHearts" => start_hearts,
      "maxHearts" => max_hearts,
      "endingTitle" => text_value(
        settings_source["endingTitle"],
        DEFAULT_GAME_DATA["settings"]["endingTitle"]
      ),
      "endingLetter" => text_value(
        settings_source["endingLetter"],
        DEFAULT_GAME_DATA["settings"]["endingLetter"]
      )
    },
    "map" => {
      "title" => text_value(map_source["title"], DEFAULT_GAME_DATA["map"]["title"]),
      "backgroundType" => map_source["backgroundType"].to_s == "image" ? "image" : "gradient",
      "backgroundValue" => text_value(map_source["backgroundValue"], DEFAULT_GAME_DATA["map"]["backgroundValue"]),
      "imageUrl" => text_value(map_source["imageUrl"], ""),
      "showGrid" => map_source.key?("showGrid") ? bool_value(map_source["showGrid"]) : true,
      "nodes" => normalize_nodes(map_source["nodes"], levels)
    },
    "characters" => normalize_characters(raw["characters"]),
    "levels" => levels
  }
end


def default_progress(game_data)
  {
    "hearts" => game_data["settings"]["startHearts"],
    "maxHearts" => game_data["settings"]["maxHearts"],
    "currentLevelIndex" => 0,
    "completed" => {},
    "feedback" => nil,
    "readyNext" => false,
    "finished" => false,
    "levelSignature" => levels_signature(game_data["levels"])
  }
end


def normalize_progress(raw, game_data)
  base = default_progress(game_data)
  return base unless raw.is_a?(Hash)
  return base if raw["levelSignature"] != base["levelSignature"]

  base["hearts"] = clamp(coerce_int(raw["hearts"], base["hearts"]), 0, base["maxHearts"])
  base["currentLevelIndex"] = clamp(coerce_int(raw["currentLevelIndex"], 0), 0, game_data["levels"].length - 1)

  if raw["completed"].is_a?(Hash)
    completed = {}
    raw["completed"].each do |key, value|
      completed[key.to_s] = true if bool_value(value)
    end
    base["completed"] = completed
  end

  if raw["feedback"].is_a?(Hash)
    type = raw["feedback"]["type"].to_s
    text = text_value(raw["feedback"]["text"], "")
    if %w[correct fail].include?(type) && !text.empty?
      base["feedback"] = { "type" => type, "text" => text }
    end
  end

  base["readyNext"] = bool_value(raw["readyNext"])
  base["finished"] = bool_value(raw["finished"])
  base
end


def password_digest(password)
  salt = SecureRandom.hex(16)
  hash = Digest::SHA256.hexdigest("#{salt}:#{password}")
  "#{salt}$#{hash}"
end


def password_valid?(password, stored)
  salt, expected = stored.to_s.split("$", 2)
  return false if salt.to_s.empty? || expected.to_s.empty?

  Digest::SHA256.hexdigest("#{salt}:#{password}") == expected
end


def username_valid?(username)
  username.match?(/\A[a-zA-Z0-9_]{3,24}\z/)
end


class Storage
  def initialize(path)
    FileUtils.mkdir_p(File.dirname(path))
    @db = SQLite3::Database.new(path)
    @db.results_as_hash = true
    @db.execute("PRAGMA foreign_keys = ON")
    migrate!
    seed!
  end

  def migrate!
    @db.execute_batch <<~SQL
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS game_data (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL,
        level_id INTEGER,
        payload TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    SQL
  end

  def seed!
    unless game_data_present?
      payload = JSON.generate(normalize_game_data(DEFAULT_GAME_DATA))
      @db.execute(
        "INSERT INTO game_data (id, payload, updated_at) VALUES (1, ?, ?)",
        [payload, iso_now]
      )
    end

    return if user_by_username(DEFAULT_ADMIN_USERNAME)

    create_user(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, "admin")
  end

  def game_data_present?
    row = @db.get_first_row("SELECT id FROM game_data WHERE id = 1")
    !row.nil?
  end

  def user_by_username(username)
    @db.get_first_row("SELECT id, username, password_hash, role FROM users WHERE username = ?", [username])
  end

  def user_by_id(user_id)
    @db.get_first_row("SELECT id, username, role FROM users WHERE id = ?", [user_id])
  end

  def create_user(username, password, role = "user")
    digest = password_digest(password)
    @db.execute(
      "INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
      [username, digest, role, iso_now]
    )
    user_by_username(username)
  end

  def create_session(user_id)
    token = SecureRandom.hex(32)
    now = Time.now.utc
    expires_at = (now + TOKEN_TTL_SECONDS).iso8601
    @db.execute(
      "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
      [token, user_id, expires_at, now.iso8601]
    )
    token
  end

  def valid_session_token?(token)
    token.to_s.match?(/\A[a-f0-9]{64}\z/)
  end

  def session_with_user(token)
    return nil unless valid_session_token?(token)

    escaped = token.to_s.gsub("'", "''")
    sql = <<~SQL
      SELECT
        sessions.token,
        sessions.expires_at,
        users.id,
        users.username,
        users.role
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = '#{escaped}'
    SQL
    @db.get_first_row(sql)
  end

  def delete_session(token)
    return unless valid_session_token?(token)

    escaped = token.to_s.gsub("'", "''")
    @db.execute("DELETE FROM sessions WHERE token = '#{escaped}'")
  end

  def game_data
    row = @db.get_first_row("SELECT payload FROM game_data WHERE id = 1")
    normalize_game_data(JSON.parse(row["payload"]))
  rescue StandardError
    normalize_game_data(DEFAULT_GAME_DATA)
  end

  def update_game_data(payload, updated_by)
    @db.execute(
      "UPDATE game_data SET payload = ?, updated_at = ?, updated_by = ? WHERE id = 1",
      [JSON.generate(payload), iso_now, updated_by]
    )
  end

  def progress_for(user_id)
    row = @db.get_first_row("SELECT payload FROM progress WHERE user_id = ?", [user_id])
    return nil unless row

    JSON.parse(row["payload"])
  rescue StandardError
    nil
  end

  def save_progress(user_id, payload)
    sql = <<~SQL
      INSERT INTO progress (user_id, payload, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    SQL
    @db.execute(sql, [user_id, JSON.generate(payload), iso_now])
  end

  def log_event(user_id, event_type, level_id = nil, payload = nil)
    @db.execute(
      "INSERT INTO events (user_id, event_type, level_id, payload, created_at) VALUES (?, ?, ?, ?, ?)",
      [user_id, event_type, level_id, payload ? JSON.generate(payload) : nil, iso_now]
    )
  end

  def analytics_summary
    total_users = @db.get_first_value("SELECT COUNT(*) FROM users WHERE role = 'user'").to_i
    today_start = Time.now.utc.strftime("%Y-%m-%dT00:00:00Z")
    active_today = @db.get_first_value(
      "SELECT COUNT(DISTINCT user_id) FROM events WHERE user_id IS NOT NULL AND created_at >= ?",
      [today_start]
    ).to_i

    answer_rows = @db.get_first_row(
      <<~SQL
        SELECT
          SUM(CASE WHEN event_type = 'answer_correct' THEN 1 ELSE 0 END) AS correct_count,
          SUM(CASE WHEN event_type = 'answer_wrong' THEN 1 ELSE 0 END) AS wrong_count
        FROM events
      SQL
    )

    correct_count = answer_rows["correct_count"].to_i
    wrong_count = answer_rows["wrong_count"].to_i
    total_attempts = correct_count + wrong_count
    accuracy = total_attempts.zero? ? 0.0 : ((correct_count.to_f / total_attempts) * 100.0).round(2)

    progress_rows = @db.execute("SELECT payload FROM progress")
    completed_runs = progress_rows.count do |row|
      begin
        payload = JSON.parse(row["payload"])
        bool_value(payload["finished"])
      rescue StandardError
        false
      end
    end

    top_levels = @db.execute(
      <<~SQL
        SELECT
          level_id,
          SUM(CASE WHEN event_type = 'answer_correct' THEN 1 ELSE 0 END) AS correct_count,
          SUM(CASE WHEN event_type = 'answer_wrong' THEN 1 ELSE 0 END) AS wrong_count
        FROM events
        WHERE event_type IN ('answer_correct', 'answer_wrong') AND level_id IS NOT NULL
        GROUP BY level_id
        ORDER BY wrong_count DESC, correct_count DESC
        LIMIT 10
      SQL
    ).map do |row|
      {
        "levelId" => row["level_id"].to_i,
        "correct" => row["correct_count"].to_i,
        "wrong" => row["wrong_count"].to_i
      }
    end

    {
      "totalUsers" => total_users,
      "activeToday" => active_today,
      "totalAttempts" => total_attempts,
      "correctAnswers" => correct_count,
      "wrongAnswers" => wrong_count,
      "accuracyPercent" => accuracy,
      "completedRuns" => completed_runs,
      "topLevels" => top_levels
    }
  end
end


def json_response(res, status, payload)
  res.status = status
  res["Content-Type"] = "application/json"
  res.body = JSON.generate(payload)
end


def parse_json_body(req)
  return {} if req.body.nil? || req.body.strip.empty?

  JSON.parse(req.body)
rescue JSON::ParserError
  nil
end


def bearer_token(req)
  header = req.header["authorization"]&.first.to_s
  header = req.header["x-auth-token"]&.first.to_s if header.empty?
  header = req["authorization"].to_s if header.empty?
  header = req["Authorization"].to_s if header.empty?
  header = req["x-auth-token"].to_s if header.empty?
  if header.empty? && req.respond_to?(:meta_vars)
    header = req.meta_vars["HTTP_AUTHORIZATION"].to_s
  end
  return nil if header.empty?

  return header.split(" ", 2)[1].to_s.strip if header.start_with?("Bearer ")
  header.strip
end


def authenticated_user(req, storage)
  token = bearer_token(req).to_s.strip.downcase
  return nil if token.to_s.empty?

  session_row = storage.session_with_user(token)
  return nil unless session_row

  expires_at = Time.parse(session_row["expires_at"])
  if expires_at <= Time.now.utc
    storage.delete_session(token)
    return nil
  end

  {
    "id" => session_row["id"].to_i,
    "username" => session_row["username"],
    "role" => session_row["role"],
    "token" => token
  }
rescue StandardError
  nil
end


def ensure_user(req, res, storage)
  user = authenticated_user(req, storage)
  unless user
    json_response(res, 401, { "error" => "Authentication required" })
    return nil
  end
  user
end


def ensure_admin(req, res, storage)
  user = ensure_user(req, res, storage)
  return nil unless user

  unless user["role"] == "admin"
    json_response(res, 403, { "error" => "Admin access required" })
    return nil
  end

  user
end


def export_user(user)
  {
    "id" => user["id"].to_i,
    "username" => user["username"],
    "role" => user["role"]
  }
end


def upload_extension_allowed?(ext)
  %w[.png .jpg .jpeg .gif .webp .svg].include?(ext.downcase)
end

storage = Storage.new(DB_PATH)
FileUtils.mkdir_p(UPLOAD_DIR)

port = coerce_int(ENV["PORT"], 4567)
server = WEBrick::HTTPServer.new(
  Port: port,
  BindAddress: BIND_ADDRESS,
  DocumentRoot: ROOT_DIR,
  AccessLog: [],
  Logger: WEBrick::Log.new($stderr, WEBrick::Log::INFO)
)

server.mount_proc "/api" do |req, res|
  res["Cache-Control"] = "no-store"
  path = req.path.sub(%r{\A/api}, "")
  method = req.request_method

  begin
    case [method, path]
    when ["GET", "/health"]
      json_response(res, 200, { "ok" => true, "time" => iso_now })

    when ["POST", "/auth/register"]
      body = parse_json_body(req)
      if body.nil?
        json_response(res, 400, { "error" => "Invalid JSON" })
        next
      end

      username = body["username"].to_s.strip
      password = body["password"].to_s

      unless username_valid?(username)
        json_response(res, 422, { "error" => "Username must be 3-24 chars (letters, numbers, underscore)." })
        next
      end

      if password.length < 6
        json_response(res, 422, { "error" => "Password must be at least 6 characters." })
        next
      end

      begin
        user = storage.create_user(username, password, "user")
      rescue SQLite3::ConstraintException
        json_response(res, 409, { "error" => "Username already exists." })
        next
      end

      token = storage.create_session(user["id"])
      storage.log_event(user["id"], "register", nil, { "username" => username })
      json_response(res, 201, { "token" => token, "user" => export_user(user) })

    when ["POST", "/auth/login"]
      body = parse_json_body(req)
      if body.nil?
        json_response(res, 400, { "error" => "Invalid JSON" })
        next
      end

      username = body["username"].to_s.strip
      password = body["password"].to_s
      user = storage.user_by_username(username)

      unless user && password_valid?(password, user["password_hash"])
        json_response(res, 401, { "error" => "Invalid credentials." })
        next
      end

      token = storage.create_session(user["id"])
      storage.log_event(user["id"], "login")
      json_response(res, 200, { "token" => token, "user" => export_user(user) })

    when ["POST", "/auth/logout"]
      user = ensure_user(req, res, storage)
      next unless user

      storage.delete_session(user["token"])
      storage.log_event(user["id"], "logout")
      json_response(res, 200, { "ok" => true })

    when ["GET", "/auth/me"]
      user = ensure_user(req, res, storage)
      next unless user

      json_response(res, 200, { "user" => export_user(user) })

    when ["GET", "/game-data"]
      user = ensure_user(req, res, storage)
      next unless user

      json_response(res, 200, { "data" => storage.game_data })

    when ["GET", "/progress"]
      user = ensure_user(req, res, storage)
      next unless user

      game_data = storage.game_data
      current = storage.progress_for(user["id"])
      normalized = normalize_progress(current, game_data)
      storage.save_progress(user["id"], normalized) if current != normalized
      json_response(res, 200, { "state" => normalized })

    when ["POST", "/progress/reset"]
      user = ensure_user(req, res, storage)
      next unless user

      game_data = storage.game_data
      state = default_progress(game_data)
      storage.save_progress(user["id"], state)
      storage.log_event(user["id"], "run_reset")
      json_response(res, 200, { "state" => state })

    when ["POST", "/progress/next"]
      user = ensure_user(req, res, storage)
      next unless user

      game_data = storage.game_data
      state = normalize_progress(storage.progress_for(user["id"]), game_data)

      unless bool_value(state["readyNext"])
        json_response(res, 409, { "error" => "Current level not completed yet." })
        next
      end

      state["currentLevelIndex"] = clamp(state["currentLevelIndex"] + 1, 0, game_data["levels"].length - 1)
      state["readyNext"] = false
      state["feedback"] = nil

      storage.save_progress(user["id"], state)
      storage.log_event(user["id"], "level_advance", game_data["levels"][state["currentLevelIndex"]]["id"])
      json_response(res, 200, { "state" => state })

    when ["POST", "/progress/select"]
      user = ensure_user(req, res, storage)
      next unless user

      body = parse_json_body(req)
      if body.nil?
        json_response(res, 400, { "error" => "Invalid JSON" })
        next
      end

      game_data = storage.game_data
      state = normalize_progress(storage.progress_for(user["id"]), game_data)
      target_index = clamp(coerce_int(body["levelIndex"], state["currentLevelIndex"]), 0, game_data["levels"].length - 1)
      target_level = game_data["levels"][target_index]

      # Prevent selecting locked future levels.
      if target_index > state["currentLevelIndex"] && !state["completed"][target_level["id"].to_s]
        json_response(res, 409, { "error" => "Level is locked." })
        next
      end

      state["currentLevelIndex"] = target_index
      state["readyNext"] = false
      state["feedback"] = nil

      storage.save_progress(user["id"], state)
      storage.log_event(user["id"], "level_select", target_level["id"])
      json_response(res, 200, { "state" => state })

    when ["POST", "/progress/answer"]
      user = ensure_user(req, res, storage)
      next unless user

      body = parse_json_body(req)
      if body.nil?
        json_response(res, 400, { "error" => "Invalid JSON" })
        next
      end

      game_data = storage.game_data
      state = normalize_progress(storage.progress_for(user["id"]), game_data)
      current_index = state["currentLevelIndex"]
      level = game_data["levels"][current_index]

      if bool_value(state["finished"])
        json_response(res, 409, { "error" => "Run already complete.", "state" => state })
        next
      end

      answer_index = coerce_int(body["answerIndex"], -1)
      correct = answer_index == level["answerIndex"]

      if correct
        state["hearts"] = clamp(state["hearts"] + 1, 0, state["maxHearts"])
        state["completed"][level["id"].to_s] = true
        state["feedback"] = { "type" => "correct", "text" => "Correct. #{level["explanation"]}" }

        if current_index == game_data["levels"].length - 1
          state["finished"] = true
          state["readyNext"] = false
        else
          state["readyNext"] = true
        end

        storage.log_event(user["id"], "answer_correct", level["id"], { "answerIndex" => answer_index })
      else
        state["hearts"] = clamp(state["hearts"] - 1, 0, state["maxHearts"])
        state["feedback"] = { "type" => "fail", "text" => "Not quite. Try again." }
        state["readyNext"] = false

        storage.log_event(user["id"], "answer_wrong", level["id"], { "answerIndex" => answer_index })
      end

      storage.save_progress(user["id"], state)
      json_response(res, 200, { "correct" => correct, "state" => state, "levelId" => level["id"] })

    when ["POST", "/analytics/event"]
      user = ensure_user(req, res, storage)
      next unless user

      body = parse_json_body(req)
      if body.nil?
        json_response(res, 400, { "error" => "Invalid JSON" })
        next
      end

      event_type = text_value(body["eventType"], "custom")
      level_id = body.key?("levelId") ? coerce_int(body["levelId"], nil) : nil
      payload = body["payload"].is_a?(Hash) ? body["payload"] : {}
      storage.log_event(user["id"], event_type, level_id, payload)

      json_response(res, 200, { "ok" => true })

    when ["PUT", "/admin/game-data"]
      admin = ensure_admin(req, res, storage)
      next unless admin

      body = parse_json_body(req)
      if body.nil? || !body["data"].is_a?(Hash)
        json_response(res, 422, { "error" => "Expected payload { data: {...} }" })
        next
      end

      normalized = normalize_game_data(body["data"])
      storage.update_game_data(normalized, admin["id"])
      storage.log_event(admin["id"], "admin_update_game_data")
      json_response(res, 200, { "data" => normalized })

    when ["POST", "/admin/upload"]
      admin = ensure_admin(req, res, storage)
      next unless admin

      upload = req.query["file"]
      if upload.nil? || !upload.respond_to?(:filename)
        json_response(res, 422, { "error" => "Upload form must include a file field named 'file'." })
        next
      end

      filename = upload.filename.to_s
      ext = File.extname(filename).downcase
      unless upload_extension_allowed?(ext)
        json_response(res, 422, { "error" => "Unsupported file type." })
        next
      end

      payload = upload.to_s
      if payload.bytesize > MAX_UPLOAD_BYTES
        json_response(res, 413, { "error" => "File too large (max 5MB)." })
        next
      end

      FileUtils.mkdir_p(UPLOAD_DIR)
      safe_name = "#{Time.now.to_i}_#{SecureRandom.hex(8)}#{ext}"
      target_path = File.join(UPLOAD_DIR, safe_name)
      File.binwrite(target_path, payload)

      url = "/uploads/#{safe_name}"
      storage.log_event(admin["id"], "admin_upload_asset", nil, { "filename" => safe_name })
      json_response(res, 201, { "url" => url })

    when ["GET", "/admin/analytics"]
      admin = ensure_admin(req, res, storage)
      next unless admin

      json_response(res, 200, { "summary" => storage.analytics_summary })

    else
      json_response(res, 404, { "error" => "Not found" })
    end
  rescue StandardError => e
    json_response(res, 500, { "error" => "Server error", "detail" => e.message })
  end
end

trap("INT") { server.shutdown }
trap("TERM") { server.shutdown }

puts "Map Quest server running on http://#{BIND_ADDRESS}:#{port}"
puts "Default admin login: #{DEFAULT_ADMIN_USERNAME} / #{DEFAULT_ADMIN_PASSWORD}"
server.start
