# TeamWork Tracker - プロジェクト要件定義

## 1. プロジェクト概要

### プロジェクト名
TeamWork Tracker (仮)

### 概要
社内チームメンバーの業務内容（予実）と稼働時間を可視化し、管理者が「業務が計画通り進んでいるか」を即座に判断するためのWebアプリケーション。

### 現状の課題
- Slackでのテキスト報告では過去ログの検索が困難
- 稼働時間の集計が手作業で非効率
- 計画に対する遅延（サボりやトラブル）の検知がしづらい

### 解決アプローチ
業務報告をシステム化し、予実管理と稼働時間の可視化を実現する。

---

## 2. アプリのゴール (WHO / WHAT / HOW)

### WHO（誰が）
- **管理者（PM/リーダー）**: メンバーの動きを監視・管理したい
- **メンバー（社員/委託）**: 日々の業務報告を行う

### WHAT（何を）
- 「昨日の実績」と「今日の予定」をセットで報告・管理する
- 稼働時間を自動集計し、予実のズレを可視化する

### HOW（どのように）
- 毎朝10時の報告を必須化
- 未提出や予実のズレを可視化することで、適正な業務遂行を担保する

---

## 3. ターゲットユーザー詳細

### 管理者
**ニーズ**
- パッと見て「今日誰が何をしているか」「昨日のタスクは終わったか」を知りたい

**ペイン（痛み）**
- 報告を忘れている人への催促が面倒
- テキスト報告だと集計が手作業になる

**行動パターン**
- 毎朝ログインし、ダッシュボードで全員の状況をざっと確認
- 気になったメンバーのみ詳細を見る

### メンバー
**ニーズ**
- 報告にかかる時間を最小限にしたい

**行動パターン**
- スマホまたはPCでアクセスし、朝の数分で入力を完了させる

---

## 4. 主要機能

### MVP（Ver 1.0 - 必須機能）

#### 4.1 認証機能 ✅ 実装済み
- メールアドレス/パスワードによるログイン ✅
- Googleアカウントでのログイン（OAuth） ✅
- LINEアカウントでのログイン（OAuth） ✅ **2026-01-14追加**
- サインアップ（新規登録） ✅
- パスワードリセット機能 ✅
- ログアウト機能 ✅

#### 4.2 ダッシュボード（一覧画面） ✅ 実装済み
- メンバー全員のカード表示 ✅
- 「昨日の実績（時間・内容）」と「今日の予定（時間・内容）」を並列表示 ✅
- 未提出者の強調表示（赤字・セクション分離） ✅
- 日付選択機能（過去の報告も確認可能） ✅
- 統計情報表示（提出率、合計稼働時間、未提出者数） ✅
- 当月の自分の稼働時間表示 ✅
- ユーザー詳細へのリンク ✅
- レスポンシブ対応（スマホ/PC） ✅

#### 4.3 日次報告機能 ✅ 実装済み
**入力項目**
- 昨日の実績入力（タスク名、実働時間、完了フラグ） ✅
- 今日の予定入力（タスク名、予定時間） ✅
- 困りごと/相談入力（任意） ✅

**機能**
- 報告の新規作成・編集 ✅
- 前日の「今日の予定」から自動引き継ぎ ✅
- バリデーション（最低1つのタスク必須） ✅

**UI**
- 専用ページ（/report） ✅
- スマホ/PCどちらでも入力しやすい設計 ✅

#### 4.4 詳細画面 ✅ 実装済み
- 特定メンバーの過去ログ表示 ✅
- 期間選択（7日/30日/90日） ✅
- 稼働時間の合計・平均表示 ✅
- 統計情報（報告数、平均稼働時間など） ✅

#### 4.5 リマインド機能 ✅ 実装済み
- LINE連携によるリマインド通知 ✅
- 毎朝9:00（Vercel Cron）に全ユーザーへ自動送信 ✅ **2026-01-14変更**
- 6桁コードによるLINE連携フロー ✅
- 連携解除機能 ✅

#### 4.6 設定画面 ✅ 実装済み
- プロフィール編集（名前変更） ✅
- LINE連携の管理 ✅

#### 4.7 管理者機能 ✅ 実装済み
- ユーザー管理画面（/admin/users） ✅
- ユーザー削除機能 ✅
- 管理者権限の付与・剥奪 ✅ **2026-02-02追加**
- LINE連携状態の確認 ✅
- 管理者権限によるアクセス制御 ✅
- 稼働時間のCSVエクスポート機能 ✅ **2026-02-02追加**

### 将来機能（Ver 2.0以降 - 保留）

#### Phase 2
- ~~未提出者への自動催促メッセージ送信~~ → LINE連携で実装済み ✅
- ~~稼働時間のCSVエクスポート~~ → 実装済み ✅

#### Phase 3
- Slack連携（通知のSlack転送）
- グラフによる稼働時間の推移分析
- チーム単位での集計・比較機能

---

## 5. UI/UX方針

### デザインコンセプト
**"Minimal & Monitoring"**
- 装飾は最低限にし、情報の視認性を最優先する
- 「異常（未提出・遅延）」が直感的に分かる配色
  - 正常: 青/黒系
  - 異常: 赤系
  - 警告: 黄/オレンジ系

### 画面遷移
極力少なくする基本フロー:
```
ログイン → ダッシュボード（基本ここで完結）
         ├→ 報告入力（モーダル/ページ）
         └→ 詳細確認（個別メンバー）
```

### レスポンシブ対応
- **スマホ**: メンバーの入力操作に最適化
- **PC**: 管理者の一覧閲覧・管理操作に最適化
- ブレークポイント: モバイルファースト設計

### アクセシビリティ
- キーボード操作対応
- 色覚異常への配慮（色だけに依存しない情報伝達）

---

## 6. 技術仕様

### 推奨スタック

| カテゴリ | 技術 | 理由 |
|---------|------|------|
| Frontend | Next.js (App Router) | モダンなReactフレームワーク、SEO対応 |
| Styling | Tailwind CSS | 高速開発、一貫したデザイン |
| Backend/DB | Supabase | サーバーレス、Auth/DB/Realtimeを一元管理 |
| Hosting | Vercel | Next.jsとの親和性、簡単デプロイ |
| Language | TypeScript | 型安全、開発効率向上 |

### データベース設計（概要）

#### profiles テーブル（旧Users）
```
- id: UUID (PK)
- email: string
- name: string
- role: enum (admin, member)
- created_at: timestamp
- updated_at: timestamp
- line_user_id: string | null        # LINE連携用ユーザーID
- line_linking_code: string | null   # 6桁連携コード
- line_linking_code_expires_at: timestamp | null  # コード有効期限
- line_linked_at: timestamp | null   # LINE連携完了日時
```

#### reports テーブル
```
- id: UUID (PK)
- user_id: UUID (FK → profiles)
- report_date: date
- yesterday_tasks: jsonb[] (タスク名、実働時間、完了フラグ)
- today_tasks: jsonb[] (タスク名、予定時間)
- notes: text (困りごと/相談)
- submitted_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

### 環境変数
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LINE Messaging API（リマインド通知用）
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=

# LINE Login（ログイン認証用）
LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=

# Vercel Cron認証
CRON_SECRET=

# アプリURL
NEXT_PUBLIC_APP_URL=
```

---

## 7. 開発ロードマップ

### Phase 1: 環境構築 ✅ 完了
- [x] Next.jsプロジェクト作成
- [x] Supabaseプロジェクト作成
- [x] 環境変数設定
- [x] 基本的なディレクトリ構造の構築

### Phase 2: DB設計・認証 ✅ 完了
- [x] Supabase DB設計（profiles, reportsテーブル）
- [x] Row Level Security (RLS) 設定
- [x] 認証機能実装（ログイン/ログアウト/サインアップ）
- [x] Googleログイン（OAuth）対応
- [x] パスワードリセット機能
- [x] 認証状態の管理

### Phase 3: 報告機能 ✅ 完了
- [x] 報告フォームUI作成
- [x] バリデーション実装
- [x] DBへの保存処理
- [x] 編集機能
- [x] 前日タスクの自動引き継ぎ

### Phase 4: ダッシュボード ✅ 完了
- [x] データ取得処理
- [x] カード形式での表示
- [x] 未提出者の強調表示
- [x] 日付選択機能
- [x] 統計情報表示
- [x] レスポンシブ対応

### Phase 5: 詳細画面 ✅ 完了
- [x] メンバー個別ページ作成
- [x] 過去ログ表示（期間フィルタリング: 7日/30日/90日）
- [x] 稼働時間の集計・統計表示

### Phase 6: 通知機能 ✅ 完了
- [x] LINE連携機能（6桁コード認証）
- [x] LINEリマインド自動送信（Vercel Cron: 毎朝9:40）
- [x] 未提出者のみへの送信

### Phase 7: 管理者機能 ✅ 完了
- [x] ユーザー管理画面
- [x] ユーザー削除機能
- [x] 管理者権限制御
- [x] 管理者権限の付与・剥奪機能実装 **2026-02-02**
- [x] 稼働時間のCSVエクスポート機能実装 **2026-02-02**

### Phase 8: デプロイ ✅ 完了
- [x] Vercelへのデプロイ
- [x] 本番環境での動作確認
- [x] Vercel Cron設定

### 今後の予定
- [ ] 単体テスト
- [ ] E2Eテスト（Playwright）
- [ ] グラフによる稼働時間の推移分析

---

## 8. 成功基準

### 定量的指標
- [ ] メンバー全員が毎朝10時までに報告を完了できること（達成率90%以上）
- [ ] 管理者がログインから1分以内に「今日フォローが必要なメンバー」を特定できること
- [ ] 日々の稼働合計時間が自動で計算され、スプレッドシート等への転記作業がゼロになること

### 定性的指標
- [ ] メンバーの報告入力時間が平均5分以内
- [ ] 管理者が「見やすい」「使いやすい」と評価する
- [ ] 報告漏れが現状比50%以上削減される

### KPI
- 日次報告の提出率（目標: 95%以上）
- ダッシュボードの平均閲覧時間（目標: 2分以内）
- システム利用継続率（目標: 3ヶ月後も100%）

---

## 9. 注意事項・制約

### セキュリティ
- パスワードは必ずハッシュ化して保存（Supabase Authで自動対応）
- RLS（Row Level Security）を必ず設定し、データの不正アクセスを防ぐ
- 管理者とメンバーの権限分離を徹底

### パフォーマンス
- ダッシュボードの初期表示は3秒以内
- 画像・アセットの最適化
- 必要に応じてページネーション実装

### 運用
- エラーログの監視体制
- バックアップ戦略（Supabaseの自動バックアップを利用）
- ユーザーサポート体制（問い合わせ窓口）

---

## 10. LINE ログイン実装詳細（2026-01-14追加）

### 概要
LINEアカウントでのログイン/新規登録機能を実装。`user_identities` テーブルでプロバイダー別のユーザーマッピングを管理し、ユーザー重複を防止。

### エンドポイント
| パス | 説明 |
|------|------|
| `/api/auth/line/start?mode=login` | LINE認証開始（ログイン/新規登録） |
| `/api/auth/line/start?mode=link` | LINE認証開始（アカウント連携） |
| `/api/auth/line/callback` | LINEからのコールバック処理 |

### フロー
```
1. ユーザーが「LINEでログイン」ボタンをクリック
2. /api/auth/line/start → LINE authorize画面へリダイレクト
3. LINE認証成功 → /api/auth/line/callback へリダイレクト
4. callback処理:
   - LINE token/profile 取得
   - user_identities で既存マッピング検索
   - あれば既存ユーザーでログイン（name/role維持）
   - なければ新規ユーザー作成
   - profiles upsert
   - セッション確立（verifyOtp）
   - /dashboard へリダイレクト
```

### データベース

#### user_identities テーブル（新規）
```sql
CREATE TABLE public.user_identities (
  provider TEXT NOT NULL,        -- 'line', 'google' など
  provider_uid TEXT NOT NULL,    -- プロバイダー側のユーザーID（小文字正規化）
  user_id UUID NOT NULL,         -- auth.users.id
  created_at TIMESTAMPTZ,
  PRIMARY KEY (provider, provider_uid)
);
```

### 重要な実装ポイント

1. **providerUid の正規化**
   - LINE の userId は必ず小文字に正規化: `providerUid = lineProfile.userId.toLowerCase()`
   - メールも決定論的に生成: `line_${providerUid}@line.local`

2. **既存ユーザーの name/role 維持**
   - 既存ユーザー（identity_found）の場合、`name` と `role` は更新しない
   - LINE連携情報（`line_user_id`, `line_linked_at`）のみ更新

3. **メール重複時のリカバリー**
   - auth.users にメールが既に存在する場合、`get_auth_user_id_by_email` RPC で検索
   - user_identities にマッピングを追加して続行

4. **管理者判定**
   - `profiles.role = 'admin'` で判定（シンプルな実装）

### LINE Developers Console 設定
- **Callback URL**: `https://llotus-work-hub.vercel.app/api/auth/line/callback`

---

## 11. 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

## 更新履歴

| 日付 | バージョン | 更新内容 | 更新者 |
|------|-----------|---------|--------|
| 2026-01-08 | 1.0 | 初版作成 | - |
| 2026-01-10 | 1.1 | 実装済み機能の追記、LINE連携・管理者機能等を反映 | - |
| 2026-01-14 | 1.2 | LINEログイン機能追加、リマインド時間変更（9:00/全ユーザー）、user_identitiesテーブル追加 | - |
| 2026-02-02 | 1.3 | 管理者権限管理、CSVエクスポート機能追加 | Gemini |

---

**Note**: この要件定義は開発の進行に応じて更新されます。機能追加や変更があった場合は、必ずこのドキュメントを更新してください。
