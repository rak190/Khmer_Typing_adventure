# Firebase Progress Integration & Security Hardening (Tasks 6 & 6.1)

> [!IMPORTANT]
> **Safety Notice:** No production reads, writes, migrations, rule applications, deployments, or Git pushes have been performed. All development and testing have been performed locally on branch `feat/task-6.1-firebase-hardening`.

---

## 1. Overview & Architecture

Previously, client code performed direct client writes to Firestore across student progress summaries, lesson records, inventory, and user economy documents. Because production/staging Firestore rules deny all direct client writes (`allow write: if false;`), these operations failed or permitted forged client mutations.

Task 6 introduced a draft callable for `submitLessonAttempt` and strict Firestore rules, but left shop purchases, boss hearts, inventory, daily quests, achievements, and user profiles doing direct client writes.

**Task 6.1 completes the security hardening** by moving all sensitive mutations to trusted backend Cloud Functions callables with server-side validation and atomic Firestore transactions, while providing graceful local fallbacks for demo and offline play.

```mermaid
flowchart TD
  subgraph Client [Client Application (Web & 3D)]
    A[2D / 3D Gameplay & Shop] --> B{Online Backend Available?}
    B -- Yes (Staging / Emulator) --> C[Callable Cloud Functions]
    B -- No (Offline / Demo) --> D[Local Storage & In-Memory Cache]
  end

  subgraph CloudFunctions [Trusted Cloud Functions Backend]
    C --> E[submitLessonAttempt]
    C --> F[purchaseShopItem]
    C --> G[prepareBossAttempt]
    C --> H[consumeInventoryItem]
    C --> I[claimDailyQuestReward]
    C --> J[claimAchievementReward]
    C --> K[updateUserProfile]
    C --> L[refillHearts]
  end

  subgraph Firestore [Firestore Security & Storage]
    E & F & G & H & I & J & K & L --> M[(Admin SDK Transactions)]
    N[Client Direct Write] -.->|Blocked: allow write: if false| M
    O[Client Read] -->|Allowed: allow read: if owns(uid)| M
  end
```

---

## 2. Hardened Cloud Functions Callables

All callables verify `context.auth`, reject unauthenticated requests, validate payloads, and execute atomic transactions using the Firebase Admin SDK:

| Callable Name | Input Payload | Server Validation & Enforcement | Atomic Updates |
| :--- | :--- | :--- | :--- |
| `submitLessonAttempt` | `LessonAttempt` (metrics, stages, attemptId, lessonId) | Schema validation, score calculation, cpm/wpm bounds, curriculum version check, predecessor unlocked check, attempt deduplication via `rewardClaims/attempt-{uuid}` | `students/{uid}/progress/summary`, `students/{uid}/lessonProgress/{id}`, `users/{uid}`, `lessonResults/{docId}`, economy achievements, daily quest progress |
| `purchaseShopItem` | `{ itemId: string }` | Validates item exists in `SHOP_ITEMS`, rejects `comingSoon: true`, enforces authoritative server price (ignores client price overrides), verifies sufficient coins/gems balance, enforces non-consumable duplicate ownership check | Decrements currency in `users/{uid}`, increments quantity or sets `owned: true` in `users/{uid}/inventory/{itemId}`, handles `extra-heart` effect (capped at maxHearts), logs `economyEvents` |
| `prepareBossAttempt` | `{ attemptId?: string }` | Checks retry token quantity first (priority over hearts); if token > 0, consumes token without spending heart; if no token, verifies hearts > 0 (evaluating lazy 30-min refill); enforces attemptId idempotency | Decrements retry token in `inventory/retry-token` OR decrements heart in `users/{uid}`, records `bossAttempts/{attemptId}`, logs `economyEvents` |
| `consumeInventoryItem` | `{ itemId: string }` | Validates item exists in inventory and quantity > 0 | Decrements quantity atomically in `users/{uid}/inventory/{itemId}`, logs `economyEvents` |
| `claimDailyQuestReward` | `{ questId: string, date?: string }` | Validates questId in `QUEST_REWARDS`, checks quest completion requirement in `dailyQuests/{date}`, rejects if already claimed in `claimedRewards` | Grants authoritative XP, coins, and gems to `users/{uid}`, appends questId to `claimedRewards`, logs `economyEvents` |
| `claimAchievementReward`| `{ achievementId: string }` | Validates achievementId in `KNOWN_ACHIEVEMENTS`, verifies `unlocked === true` in `achievements/{id}`, rejects if already claimed | Grants authoritative XP, coins, and gems to `users/{uid}`, sets `rewardClaimed: true`, logs `economyEvents` |
| `updateUserProfile` | `{ displayName?, equippedAvatarId?, equippedSkinId?, ... }` | Sanitizes displayName (1-40 chars, collapses whitespace), validates cosmetic IDs against regex `/^[a-zA-Z0-9_-]{1,50}$/`, strictly ignores all currency/XP/progress fields | Merges safe display fields into `users/{uid}`, writes audit record `users/{uid}/profile/private` |
| `refillHearts` | `void` | Evaluates elapsed time since `lastHeartRefillAt` (1 heart per 30 minutes, max 5 hearts) | Updates `hearts` and `lastHeartRefillAt` in `users/{uid}` |

---

## 3. Read Optimization & Document Limit Protection

1. **Predecessor Checking Without Full-Collection Scans**:
   - In Task 6, `commitAttempt` performed `tx.get(db.collection('students/${uid}/lessonProgress'))`, reading every completed lesson document on every attempt.
   - In Task 6.1, this is replaced by checking `summary.completedLessons` followed by a direct single-document read of the immediate predecessor (`${world}:${lessonNum - 1}`). This reduces read operations from $O(N)$ to $O(1)$.

2. **Bounding Summary Lesson Results**:
   - Firestore imposes a strict 1MB limit per document. Unbounded accumulation of `lessonResults` in `students/{uid}/progress/summary` would eventually cause writes to fail.
   - `summary.lessonResults` is now capped to the latest 30 entries (evicting oldest items while preserving the complete un-truncated history in `users/{uid}/lessonResults/{resultId}`).

---

## 4. Staging Configuration & Environment Guard

The backend and client enforce an explicit environment guard:
- **Allowed Environments**:
  - `VITE_USE_FIREBASE_EMULATORS === 'true'` (Local Emulator)
  - `FIREBASE_STAGE === 'staging'` or project ID containing `staging` or starting with `demo-`
- **Fail-Closed Policy**:
  - If a production project ID is detected without an explicit reviewed deployment flag, both the Cloud Functions startup and client submission functions fail closed with an explicit error: `"Production rollout requires reviewed deployment; execution halted for safety"`.

### Staging Verification Checklist

To run staging verification against a dedicated staging Firebase project:
1. Create a Firebase project named `khmer-typing-staging`.
2. Deploy Firestore rules:
   ```bash
   npx firebase deploy --only firestore:rules --project khmer-typing-staging
   ```
3. Deploy Cloud Functions:
   ```bash
   npx firebase deploy --only functions --project khmer-typing-staging
   ```
4. Build the frontend with staging configuration in `.env.staging.local`:
   ```bash
   VITE_FIREBASE_STAGE=staging
   VITE_FIREBASE_PROJECT_ID=khmer-typing-staging
   VITE_FIREBASE_API_KEY=<staging-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=khmer-typing-staging.firebaseapp.com
   ```

---

## 5. Local Setup & Testing

### Prerequisites
- Node.js 22 LTS (for Cloud Functions parity)
- Java 21+ (required for local Firestore/Auth emulators)
- npm dependencies installed

### Running Local Tests
```bash
# Run unit and contract test suites (does not require Java)
npm run check

# Build and typecheck Cloud Functions
npm run typecheck:functions
npm run build:functions

# Full client production build check
npm run build

# Run emulator integration test suite (requires Java 21+ installed)
npm run test:emulators
```

---

## 6. Rollback & Disaster Recovery Procedures

1. **Client Disablement**:
   - If an unexpected backend behavior occurs, set `VITE_FIREBASE_STAGE=""` and rebuild the client. The client will immediately fall back to safe local storage and in-memory execution without touching Firestore.
2. **Rules Preserved**:
   - Firestore security rules remain strictly `allow write: if false;`. Under no circumstances should rules be relaxed to allow direct client writes as a rollback measure.
3. **Data Integrity**:
   - Because all rewards and completions use immutable audit records (`rewardClaims/attempt-{uuid}`, `economyEvents`), any invalid transaction can be identified and reconciled from the audit log without losing legitimate student progress.
