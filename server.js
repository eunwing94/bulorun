const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'BuloERP1!';
const ADMIN_COOKIE = 'bulorun_admin';
const ADMIN_COOKIE_MAX_AGE = 24 * 60 * 60; // 24시간

app.use(cookieParser());
app.use(express.json());

// 다른 도메인에서 접속해도 API 호출 가능 (배포 시 프론트/백 분리 대비)
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function requireAdmin(req, res, next) {
  if (req.cookies && req.cookies[ADMIN_COOKIE] === '1') return next();
  res.redirect(302, '/');
}

// 비밀번호 확인 후 쿠키 발급
app.post('/api/admin-auth', function (req, res) {
  var password = (req.body && req.body.password) ? String(req.body.password).trim() : '';
  if (password === ADMIN_PASSWORD) {
    res.cookie(ADMIN_COOKIE, '1', {
      maxAge: ADMIN_COOKIE_MAX_AGE * 1000,
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
});

// 관리자 목록 (비밀번호 통과 후에만 접근)
app.get('/admin', requireAdmin, function (req, res) {
  res.sendFile(path.join(__dirname, 'admin.html'), function (err) {
    if (err) {
      console.error('admin.html sendFile:', err);
      res.status(500).send('관리자 페이지를 불러올 수 없습니다.');
    }
  });
});

// 참가 신청 목록 - 삭제 버튼 있음 (/registration에서 우클릭 5회로 진입)
app.get('/registration-delete', requireAdmin, function (req, res) {
  res.sendFile(path.join(__dirname, 'registration.html'), function (err) {
    if (err) {
      console.error('registration.html sendFile:', err);
      res.status(500).send('참가 신청 목록을 불러올 수 없습니다.');
    }
  });
});

// 참가 신청 목록 (직접 접속 불가, 쿠키 필요)
app.get('/registration', requireAdmin, function (req, res) {
  res.sendFile(path.join(__dirname, 'registration.html'), function (err) {
    if (err) {
      console.error('registration.html sendFile:', err);
      res.status(500).send('참가 신청 목록을 불러올 수 없습니다.');
    }
  });
});

// 예측 응모 목록 (직접 접속 불가, 쿠키 필요)
app.get('/prediction', requireAdmin, function (req, res) {
  res.sendFile(path.join(__dirname, 'prediction.html'), function (err) {
    if (err) {
      console.error('prediction.html sendFile:', err);
      res.status(500).send('예측 응모 조회 페이지를 불러올 수 없습니다.');
    }
  });
});

app.use(express.static(__dirname));

if (require.main === module) {
  app.listen(PORT, function () {
    console.log('불로런 서버: http://localhost:' + PORT);
  });
}

module.exports = { app };
