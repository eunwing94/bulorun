# 불로런 서버 배포 안내

---

## ✅ 백엔드 없이 Firebase만 사용 (GitHub Pages 추천)

**별도 서버나 백엔드 URL 없이** 참가신청 저장·관리자 목록을 쓰려면 **Firebase Firestore**만 설정하면 됩니다.

### 1. Firebase 프로젝트 만들기

1. [Firebase 콘솔](https://console.firebase.google.com) 접속 → **프로젝트 추가** (이름 예: bulorun)
2. **Firestore Database** → **데이터베이스 만들기** → **테스트 모드로 시작** (나중에 규칙 수정 가능)
3. **프로젝트 설정**(⚙️) → **일반** → **내 앱** → **</> 웹** 앱 추가 → 닉네임 입력 후 등록
4. 나오는 **firebaseConfig** 객체를 복사합니다.

   ```js
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### 2. 소스에 설정 넣기

**index.html**과 **admin.html** 둘 다에서 아래 부분을 찾아서 `FIREBASE_CONFIG = null` 대신 **복사한 객체**를 넣습니다.

**index.html** (맨 아래 쪽):

```html
<script>
  var FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
  ...
</script>
```

**admin.html** (같은 방식으로):

```html
<script>
  var FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
  ...
</script>
```

두 파일에 **같은 설정**을 넣어야 참가신청(메인)과 관리자 목록이 같은 DB를 봅니다.

### 3. 배포

- GitHub에 푸시하면 GitHub Pages에 반영됩니다.
- **참가신청**: 메인 페이지에서 접수하면 Firestore `registrations` 컬렉션에 저장됩니다.
- **관리자 목록**: GitHub Pages 기준으로 `https://<사용자>.github.io/bulorun/admin.html` 에 접속하면 됩니다.

### 4. Firestore 보안 규칙 (선택)

Firebase 콘솔 → **Firestore** → **규칙**에서, 테스트 모드가 불안하다면 아래처럼 바꿀 수 있습니다. (읽기/쓰기 모두 허용하는 예시)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{docId} {
      allow read, write: if true;
    }
  }
}
```

---

## GitHub Pages + 별도 백엔드 (Render 등)

**GitHub Pages는 HTML/CSS/JS만 제공합니다.** Node.js를 실행할 수 없어서 `/api/registrations`(참가신청 저장)와 `/admin`(관리자 페이지)이 **동작하지 않습니다.**

### 해결: 백엔드만 따로 호스팅하기

1. **백엔드(Node + DB)를 무료 서비스에 배포**
   - 예: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io) 등
   - 이 저장소를 연결한 뒤 **Node 서비스**로 배포하고, 생성된 URL을 복사 (예: `https://bulorun-api.onrender.com`)

2. **GitHub Pages 쪽에서 그 URL 사용하도록 설정**
   - `index.html` 맨 아래, `script.js` 로드하기 **직전**에 있는 설정을 수정합니다.

   ```html
   <script>var API_BASE_URL = 'https://bulorun-api.onrender.com';</script>
   ```

   - `https://bulorun-api.onrender.com` 부분을 **본인이 배포한 백엔드 URL**로 바꾼 뒤 커밋·푸시합니다.

3. **동작 방식**
   - **페이지**: GitHub Pages (예: `https://eunwing94.github.io/bulorun/`)
   - **참가신청 버튼 클릭** → 브라우저가 `API_BASE_URL + '/api/registrations'`로 전송 → 백엔드 서버에서 DB 저장
   - **관리자 목록**은 백엔드 URL에 직접 접속해서 확인: `https://bulorun-api.onrender.com/admin`

### Render로 백엔드만 배포하는 예시

1. [render.com](https://render.com) 가입 후 **New → Web Service**
2. GitHub 저장소 `eunwing94/bulorun` 연결
3. 설정: **Root Directory** 비움, **Build Command** `npm install`, **Start Command** `npm start`
4. **Create Web Service** 후 생성된 URL(예: `https://bulorun-xxxx.onrender.com`)을 복사
5. `index.html`에서 `API_BASE_URL`을 그 URL로 수정 후 푸시

이렇게 하면 **GitHub Pages(프론트) + Render(백엔드)** 조합으로 참가신청이 동작합니다.

---

## 접속 오류가 나는 이유 (공통)

참가신청은 **브라우저에서 서버의 `/api/registrations`로 요청**을 보냅니다.  
**HTML/CSS/JS 파일만 올리고 Node.js 앱을 실행하지 않으면** 이 API가 없어서 접수 시 **연결 오류**가 납니다.

- ✅ **필요한 것**: 서버에서 **Node.js로 이 프로젝트를 실행**해야 합니다.
- ❌ **부족한 경우**: Nginx/Apache에서 `index.html`만 서빙하고, Node는 안 띄운 경우 → `/api/registrations` 없음 → 접속 오류

---

## 1. 서버에서 Node 앱 실행

```bash
# 프로젝트 폴더에서
npm install
npm start
```

- 포트 기본값: **3000** (바꾸려면 `PORT=8080 npm start`)
- 계속 켜 두려면 **pm2** 사용 예:

```bash
npm install -g pm2
pm2 start server.js --name bulorun
pm2 save && pm2 startup
```

---

## 2. Nginx로 80/443 서빙할 때

Node를 3000번에서 띄운 뒤, Nginx에서 이 앱으로 넘깁니다.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- `your-domain.com` 접속 → Nginx → Node(3000) → HTML + `/api/registrations`, `/admin` 모두 같은 서버에서 동작

---

## 3. 프론트와 API를 다른 주소에 둔 경우

- 예: 페이지는 `https://bulorun.com`, API는 `https://api.bulorun.com`
- **index.html** `<head>` 안에 아래 한 줄을 넣으면, 참가신청만 API 서버로 보냅니다.

```html
<script>var API_BASE_URL = 'https://api.bulorun.com';</script>
```

- API 서버(이 Node 앱)에는 이미 CORS가 설정되어 있어, 다른 도메인에서 오는 요청도 받을 수 있습니다.

---

## 요약

| 배포 방식 | 참가신청 동작 |
|-----------|----------------|
| HTML만 올리고 Node 미실행 | ❌ 접속 오류 (API 없음) |
| 서버에서 `npm start` 또는 pm2로 Node 실행 | ✅ 동작 |
| Nginx 등에서 Node(3000)로 프록시 | ✅ 동작 |

**접속 오류가 나면** → 서버에서 `node server.js`(또는 `npm start`)가 실제로 돌고 있는지, 그리고 방화벽/보안 그룹에서 해당 포트가 열려 있는지 확인하면 됩니다.
