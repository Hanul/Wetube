/*
 * app에 유저 관련 함수들을 추가합니다.
 */
function injectUserFuncs(app) {

	var firebase = new Firebase('https://wetubeapp.firebaseio.com');
	var userInfo = firebase.getAuth();

	var list = document.querySelector('#list');
	list.style.display = 'none';

	// 로그인 완료 시 실행하는 함수
	var logined = function() {
		list.style.display = 'block';
		app.listSelected = 0;
		
		// 유저 정보 저장
		firebase.child('users').child(userInfo.uid).set({
			provider : userInfo.provider,
			name : userInfo.google.displayName,
			email : userInfo.google.email,
			profileImageURL : userInfo.google.profileImageURL
		});
		
		// 유저 목록 추가되었을 시
		app.addUsers = [];
		firebase.child('add-users').child(userInfo.uid).on('child_added', function(snap) {
			var user = snap.val();
			app.push('addUsers', {
				id : snap.key(),
				name : user.name,
				profileImageURL : user.profileImageURL
			});
		});
		firebase.child('add-users').child(userInfo.uid).on('child_removed', function(snap) {
			var key = snap.key();
			app.addUsers.forEach(function(user, index) {
				if (user.id == key) {
					app.splice('addUsers', index, 1);
				}
			});
		});
		
		// 누군가 나를 초대할 때
		
	};

	if (userInfo === null) {
		document.querySelector('#login').open();
	} else {
		logined();
	}

	app.googleLoggedIn = function() {

		// 유저 정보가 없으면
		if (userInfo === null) {

			// 받아온 유저 정보를 대입한다.
			userInfo = app.userInfo;

			// 로그인 버튼을 숨기기, 로그인 창을 닫는다.
			document.querySelector('#login firebase-google-login-button').style.display = 'none';
			document.querySelector('#login').close();

			// 로그인 된 이후 처리
			logined();
		}
	};

	app.logout = function() {

		userInfo = null;
		firebaseLogin.logout();

		list.style.display = 'none';
		document.querySelector('#login firebase-google-login-button').style.display = 'block';
		document.querySelector('#login').open();
	};

	app.checkAddUserKey = function(e) {
		if (e.keyCode === 13) {
			app.addUser();
		}
	};

	app.addUser = function() {
		
		var email = app.addUserEmail.trim();

		if (userInfo.google.email === email) {
			alert('본인은 추가할 수 없습니다.');
		} else {
			firebase.child('users')
			.orderByChild('email')
			.startAt(email)
			.endAt(email)
			.once('value', function(snap) {
				var users = snap.val();
				if (users === null) {
					alert('해당 이메일에 해당하는 유저가 없습니다.');
				} else {
					for (var id in users) {
						// 드디어 유저 정보를 찾았다.
						firebase.child('add-users').child(userInfo.uid).child(id).set({
							name : users[id].name,
							profileImageURL : users[id].profileImageURL
						});
						app.addUserEmail = '';
						app.addUserName = users[id].name;
						document.querySelector('#add-user-toast').show();
					}
				}
			});
		}
	};

	app.openInviteUser = function() {
		document.querySelector('#users-dialog').open();
	};
	
	app.removeUser = function(e) {
		firebase.child('add-users').child(userInfo.uid).child(e.currentTarget.dataId).remove();
	};

}
