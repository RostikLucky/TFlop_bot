////////////////////////
//                    //
//    TODO список     //
//                    //
////////////////////////
//# Ошибка: нет заданий
//# Импорт/Экспорт акков
//# Статистика акка

////////////////////////
//                    //
//     Переменные     //
//                    //
////////////////////////
bot_start = false;
dev_logs = [];
/// Монеты
stat_eaned_money = 0.00;
stat_eaned_coins = 0;
/// Задания
stat_tasks_true = 0;
stat_tasks_false = 0;
stat_category = 'все задания';
stat_category_sort = [];
/// Аккаунты
temp_stat_accounts_count = 0;
temp_stat_account_active = 0;
active_accounts_id = 0;
/// Секундомер
stopwatch_time = 0;
stopwatch_time_sec = 0;
stopwatch_time_min = 0;
stopwatch_time_hor = 0;
/// Временные переменные
temp_relogin_acc = '';
temp_bot_sleep = 0;
temp_tasks_error = 0;
temp_accounts_change = 0;
bot_edit_accounts = false;
/// Интервалы 
error_interval = start_task_interval = check_task_interval = bot_sleep_interval = error_interval = null;

///////////////////////
//                   //
//    База данных    //
//                   //
///////////////////////
accounts_settings = JSON.parse(localStorage.getItem('accounts_settings'));
bot_settings = JSON.parse(localStorage.getItem('bot_settings'));
if (accounts_settings == null || accounts_settings == '') {
	localStorage.setItem('accounts_settings', '[]');
	accounts_settings = [];
}
if (bot_settings == null || bot_settings == '') {
	localStorage.setItem('bot_settings', '{"delay_task": "05 сек.", "delay_task_check": "05 сек.", "sleep_task": "00 зад.", "sleep_time": "00 мин.", "account_change": "10 зад.", "use_sid": false, "use_relogin": false, "use_relogin_proxy": false, "use_proxy_task": true, "notify": true}');
	bot_settings = {'delay_task': '05 сек.', 'delay_task_check': '05 сек.', 'sleep_task': '00 зад.', 'sleep_time': '00 мин.', 'account_change': '10 зад.', 'use_sid': false, 'use_relogin': false, 'use_relogin_proxy': false, 'use_proxy_task': true, 'notify': true};
}

/// Новые настройки
if (bot_settings.use_relogin === undefined) {
	bot_settings.use_proxy_task = true;
	bot_settings.use_relogin = false;
	bot_settings.use_relogin_proxy = false;
	localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
}

if (bot_settings.notify === undefined) {
	bot_settings.notify = true;
	localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
}

update_account_list();
update_settings();

switch_sid = setInterval(function() {
	try {
		clearInterval(switch_sid);
		pywebview.api.switch_sid(bot_settings.use_sid);
	} catch {}
}, 500);

switch_proxy = setInterval(function() {
	try {
		clearInterval(switch_proxy);
		pywebview.api.switch_proxy(bot_settings.use_proxy_task);
	} catch {}
}, 500);

ver_app = setInterval(function() {
	try {
		clearInterval(ver_app);
		pywebview.api.ver_app();
	} catch {}
}, 500);

///////////////////////
//                   //
//    Уведомления    //
//                   //
///////////////////////
alerts_info = false;
function alerts(data) {
	if (!alerts_info) {
		alerts_info = true;
		if (data.indexOf(' --') != -1) {
			time = Number(data.split('--')[1]) * 1000;
			data = data.split('--')[0];
		} else time = 2500;
		$('#alerts').css({'transition': '1s', 'margin-bottom': '0px', 'opacity': '1'});
		alerts_timeout_1 = setTimeout(function() {
			$('#alerts').css({'margin-bottom': '-62px', 'opacity': '0'});
		}, time);
		$('#alerts_data').html(data);
		dev_log('ALERTS', data);
	} else {
		clearTimeout(alerts_timeout_1);
		alerts_info = false;
		alerts(data);
	}
}

/// Закрыть уведомление
$("#alerts").click(function(){
	clearTimeout(alerts_timeout_1);
	alerts_info = false;
	$('#alerts').css({'margin-bottom': '-62px', 'opacity': '0'});
});

/// Подсказки 
function helps_tips() {
	const elements = [...document.querySelectorAll('[tip]')]
	for (const el of $('.tooltip')) {
		el.remove()
	}
	for (const el of elements) {
		const tip = document.createElement('div')
		tip.classList.add('tooltip')
		tip.textContent = el.getAttribute('tip')
		const x = el.hasAttribute('tip-left') ? 'calc(-100% - 5px)' : '16px'
		const y = el.hasAttribute('tip-top') ? '-100%' : '20px'
		tip.style.transform = `translate(${x}, ${y})`
		el.appendChild(tip)
		el.onpointermove = e => {
			if (e.target !== e.currentTarget) return
			const rect = tip.getBoundingClientRect()
			const rectWidth = rect.width + 16
			const vWidth = window.innerWidth - rectWidth
			const rectX = el.hasAttribute('tip-left') ? e.clientX - rectWidth: e.clientX + rectWidth    
			const minX = el.hasAttribute('tip-left') ? 0 : rectX 
			const maxX = el.hasAttribute('tip-left') ? vWidth : window.innerWidth 
			const x = rectX < minX ? rectWidth : rectX > maxX ? vWidth : e.clientX
			tip.style.left = `${x}px`
			tip.style.top = `${e.clientY}px`
  		}
	}
}

////////////////////////
//                    //
//   Меню навигации   //
//                    //
////////////////////////
$(".nav_elem").click(function(){
	/// Переключение в меню
	$(".nav_elem").removeClass("nav_elem_active");
	$(".uil").removeClass("nav_elem_active");
	title = $(this).attr('title');
	ico = $(this).find('i').attr('class');
	windows = '#'+$(this).attr('window');
	if (title != 'Выход') {
		$("#header_title").html(`<i class="${ico}"></i> ${title}`);
		$(this).addClass('nav_elem_active');
		$(this).find('i').addClass('nav_elem_active');
		/// Переключение окна
		$(".main_window").removeClass("active_window");
		$(windows).addClass('active_window');
	} else {
		/// Выход из приложения
		pywebview.api.destroy()
	}
});

$('div[window="main_page"]').click();

////////////////////////
//                    //
//  Добавить аккаунт  //
//                    //
////////////////////////
$("#add_account").click(function(){
	if ($('#add_session').val() == '') {
		if ($('#add_login').val().length > 3) {
			if ($('#add_password').val().length > 5) {
				if ($('#proxy_input').val() == '') {
					next_check_login($('#add_login').val(), $('#add_password').val())
				} else {
					if ($('#proxy_input').val().indexOf('://') != -1 && $('#proxy_input').val().indexOf(':') != -1 && $('#proxy_input').val().indexOf('.') != -1) {
						next_check_login($('#add_login').val(), $('#add_password').val())
					} else alerts('<i class="uil uil-info-circle"></i> Вы ошиблись при вводе прокси!');
				}
			} else alerts('<i class="uil uil-info-circle"></i> Вы не ввели пароль от Instagram');
		} else alerts('<i class="uil uil-info-circle"></i> Вы не ввели логин от Instagram');
	} else {
		if ($('#add_session').val().length > 10) next_check_login($('#add_session').val(), $('#add_session').val());
		else alerts('<i class="uil uil-info-circle"></i> Вы неправильно ввели sessionid');
	}
	function next_check_login(login, pass) {
		if ($("#add_api").val().indexOf('.') != -1 && $("#add_api").val().length > 40) {
			pywebview.api.check_account(login, pass, $('#2FA').val(), $('#proxy_input').val(), $('#use_proxy').prop("checked"), $('#IUA').val(), $("#add_api").val(), bot_edit_accounts);
		} alerts('<i class="uil uil-info-circle"></i> Вы ошиблись при вводе API ключа!');
	}
});

/// Сгенерировать IUA
IUA = IUA.split('\n');
$("#generate_IUA").click(function(){
	item = IUA[Math.floor(Math.random()*IUA.length)];
	$("#IUA").val(item);
});
$("#generate_IUA").click();

/// Войти по 2FA SMS
$('#2FA_SMS_BTN').on('click', function() {
	pywebview.api.TwoFA_SMS($('#2FA_SMS').val());
});

/// Добавить аккаунт в базу данных
function add_account(data) {
	bot_edit_accounts = false;
	$("#add_login").val('');
	$("#proxy_input").val('');
	$("#add_password").val('');
	$("#add_session").val('');
	$("#add_api").val('');
	$("#generate_IUA").click();
	$('#2FABlock_SMS').css({'display': 'none'});
	$('#2FABlock').css({'display': 'none'});
	data = JSON.parse(data);
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == data.username) {
			accounts_settings.splice(i, 1);
			break
		}
	}
	accounts_settings.push(JSON.stringify(data));
	localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
	update_account_list();
}

///////////////////////
//                   //
//  Проверка прокси  //
//                   //
///////////////////////
$("#check_proxy").click(function(){
	data = $("#proxy_input").val();
	if (data.indexOf('://') != -1 && data.indexOf(':') != -1 && data.indexOf('.') != -1) {
		pywebview.api.check_proxy(data);
	} else alerts('<i class="uil uil-info-circle"></i> Вы ошиблись при вводе прокси!')
})

////////////////////////
//                    //
//    Проверка API    //
//                    //
////////////////////////
$("#check_api").click(function(){
	data = $("#add_api").val();
	if (data.indexOf('.') != -1 && data.length > 40) {
		pywebview.api.check_api(data);
	} else alerts('<i class="uil uil-info-circle"></i> Вы ошиблись при вводе API ключа!')
});

/////////////////////////
//                     //
// Список с аккаунтами //
//                     //
/////////////////////////
function update_account_list() {
	/// Обновить список аккаунтов
	if (accounts_settings.length == 0) $('#accounts_page').html('<div style="text-align: center; margin-bottom: 11px; color: gainsboro;">У вас отсутствуют аккаунты Instagram!</div>');
	else $('#accounts_page').html('');
	temp_stat_accounts_count = 0;
	for (var i = 0; i < accounts_settings.length; i++) {
		temp_id_acc = 0;
		if (JSON.parse(accounts_settings[i]).active_account) {
			checked = 'checked';
			temp_stat_accounts_count++;
			temp_id_acc = temp_stat_accounts_count;
		} else checked = '';
		if (JSON.parse(accounts_settings[i]).tasks_likes) checked_likes = 'checked'
		else checked_likes = ''
		if (JSON.parse(accounts_settings[i]).tasks_follows) checked_follows = 'checked'
		else checked_follows = ''
		if (JSON.parse(accounts_settings[i]).tasks_comments) checked_comments = 'checked'
		else checked_comments = ''
		/// Уведомление
		if (temp_relogin_acc == JSON.parse(accounts_settings[i]).username && !JSON.parse(accounts_settings[i]).active_account && bot_settings.notify) pywebview.api.notify('Ошибка авторизации', 'Не удалось перезайти в аккаунт!');
		$('#accounts_page').html($('#accounts_page').html() + `
		<div class="account_lable">
			<div style="margin-left: 13px;">
				<input type="checkbox" id="use_account_${JSON.parse(accounts_settings[i]).username}" class="use_account_select" ${checked}>
				<label for="use_account_${JSON.parse(accounts_settings[i]).username}" tip="Вкл/выкл аккаунт" style="width: 12px"><i class="uil uil-check"></i></label>
			</div>
			<div style="margin-left: 8px;">
				<input type="checkbox" id="account_tasks_likes_${JSON.parse(accounts_settings[i]).username}" class="account_tasks_likes" ${checked_likes}>
				<label for="account_tasks_likes_${JSON.parse(accounts_settings[i]).username}" tip="Выполнять задания на лайки" style="width: 12px"><i class="uil uil-heart-alt"></i></label>
			</div>
			<div style="margin-left: 8px;">
				<input type="checkbox" id="account_tasks_follows_${JSON.parse(accounts_settings[i]).username}" class="account_tasks_follows" ${checked_follows}>
				<label for="account_tasks_follows_${JSON.parse(accounts_settings[i]).username}" tip="Выполнять задания на подписки" style="width: 12px"><i class="uil uil-user-plus"></i></label>
			</div>
			<div style="margin-left: 8px;">
				<input type="checkbox" id="account_tasks_comments_${JSON.parse(accounts_settings[i]).username}" class="account_tasks_comments" ${checked_comments}>
				<label for="account_tasks_comments_${JSON.parse(accounts_settings[i]).username}" tip="Выполнять задания на комментарии" style="width: 12px"><i class="uil uil-comment-alt-lines"></i></label>
			</div>
			<div class="account_username" id_acc="${temp_id_acc}">${JSON.parse(accounts_settings[i]).username}</div>
			<div class="account_status">Статус: ${JSON.parse(accounts_settings[i]).account_status}</div>
			<div class="account_menu">
				<div onclick="check_money_account('${JSON.parse(accounts_settings[i]).username}')" tip="Показать баланс профиля" style="line-height: 34px;"><i class="uil uil-bill"></i></div>
				<div onclick="relogin_account('${JSON.parse(accounts_settings[i]).username}')" tip="Перезайти в аккаунт" style="line-height: 34px;"><i class="uil uil-signin"></i></div>
				<div onclick="ckeck_account('${JSON.parse(accounts_settings[i]).username}')" tip="Проверить аккаунт"><i class="uil uil-user-check"></i></div>
				<div onclick="delete_account('${JSON.parse(accounts_settings[i]).username}')" tip="Удалить аккаунт"><i class="uil uil-trash-alt"></i></div>
			</div>
		</div>`);
	}
	$('#accounts_page').html($('#accounts_page').html() + '<button style="height: 40px; width: 100%; margin-top: 0px" onclick="$(`div[window=\'add_account_page\']`).click();">Добавить аккаунты в бота</button>');
	//$('#accounts_page').html($('#accounts_page').html() + `<div style="display: flex;">
	//	<button style="height: 40px; width: 100%; margin-top: 0px; margin-right: 4px;" onclick="export_acc()">Экспорт аккаунтов</button>
	//	<button style="height: 40px; width: 100%; margin-top: 0px; margin-left: 4px;" onclick="import_acc()">Импорт аккаунтов</button></div>`);

	/// Использовать или не использовать аккаунт
	$(".use_account_select").click(function(){
		username = $(this).attr('id').replace('use_account_', '');
		for (var i = 0; i < accounts_settings.length; i++) {
			if (JSON.parse(accounts_settings[i]).username == username) {
				temp_account = JSON.parse(accounts_settings[i]);
				temp_account.active_account = $(this).prop("checked");
				if ($(this).prop("checked")) temp_account.account_status = 'активный'; 
				else temp_account.account_status = 'не используется';
				accounts_settings[i] = JSON.stringify(temp_account);
				localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
				if (temp_account.tasks_likes == false && temp_account.tasks_follows == false && temp_account.tasks_comments == false && temp_account.active_account == true) {
					$(`#account_tasks_likes_${username}`).click();
				}
				break
			}
		}
		update_account_list();
	});

	/// Выбор категории заработка 
	$(".account_tasks_likes").click(function(){
		username = $(this).attr('id').replace('account_tasks_likes_', '');
		for (var i = 0; i < accounts_settings.length; i++) {
			if (JSON.parse(accounts_settings[i]).username == username) {
				temp_account = JSON.parse(accounts_settings[i]);
				temp_account.tasks_likes = $(this).prop("checked");
				accounts_settings[i] = JSON.stringify(temp_account);
				localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
				if (temp_account.tasks_likes == false && temp_account.tasks_follows == false && temp_account.tasks_comments == false && temp_account.active_account == true) $(`#use_account_${username}`).click();
				break
			}
		}
	});
	$(".account_tasks_follows").click(function(){
		username = $(this).attr('id').replace('account_tasks_follows_', '');
		for (var i = 0; i < accounts_settings.length; i++) {
			if (JSON.parse(accounts_settings[i]).username == username) {
				temp_account = JSON.parse(accounts_settings[i]);
				temp_account.tasks_follows = $(this).prop("checked");
				accounts_settings[i] = JSON.stringify(temp_account);
				localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
				if (temp_account.tasks_likes == false && temp_account.tasks_follows == false && temp_account.tasks_comments == false && temp_account.active_account == true) $(`#use_account_${username}`).click();
				break
			}
		}
	});
	$(".account_tasks_comments").click(function(){
		username = $(this).attr('id').replace('account_tasks_comments_', '');
		for (var i = 0; i < accounts_settings.length; i++) {
			if (JSON.parse(accounts_settings[i]).username == username) {
				temp_account = JSON.parse(accounts_settings[i]);
				temp_account.tasks_comments = $(this).prop("checked");
				accounts_settings[i] = JSON.stringify(temp_account);
				localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
				if (temp_account.tasks_likes == false && temp_account.tasks_follows == false && temp_account.tasks_comments == false && temp_account.active_account == true) $(`#use_account_${username}`).click();
				break
			}
		}
	});
	helps_tips();

	/// Обновить статистику об аккаунтах
	if (temp_stat_accounts_count == 0) {
		temp_stat_account_active = 0;
		stats_logs_update()
	} else {
		temp_stat_account_active = 1;
		stats_logs_update();
	}

	/// Сменить аккаунт после блокировки
	if (bot_start && bot_edit_accounts) {
		bot_edit_accounts = false;
		if (temp_stat_accounts_count > 0) {
			temp_stat_account_active = 1;
			bot_workstation('auth_account');
		} else {
			bot_start = false;
			$('#start_bot').html('Запустить бота');
			clearInterval(stopwatch_interval);
			clearInterval(start_task_interval);
			clearInterval(check_task_interval);
			clearInterval(bot_sleep_interval);
			clearInterval(error_interval);
			bot_workstation_action = 'auth_account';
			stat_log('Отсутствуют активные аккаунты');
		}
	}
}

/// Удалить аккаунт из списка
function delete_account(username) {
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			accounts_settings.splice(i, 1);
			localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
			break
		}
	}
	update_account_list();
}

/// Показать баланс профиля
function check_money_account(username) {
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			temp_account = JSON.parse(accounts_settings[i]);
			break
		}
	}
	pywebview.api.check_money_account(temp_account['api_key']);
}

/// Перезайти в аккаунт
function relogin_account(username) {
	temp_account = '';
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			temp_account = accounts_settings[i];
			break
		}
	}
	update_account_list();
	if (temp_account != '') {
		temp_account = JSON.parse(temp_account);
		$('div[window="add_account_page"]').click();
		$("#add_login").val(temp_account.username);
		$("#proxy_input").val(temp_account.proxy);
		$("#add_password").val(temp_account.password);
		$("#add_api").val(temp_account.api_key);
		$("#IUA").val(temp_account.user_agent);
	} else stat_log('Аккаунт удалён!');
}

/// Проверить аккаунт
function ckeck_account(username) {
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			pywebview.api.check_account_valid(accounts_settings[i]);
			break
		}
	}
}

/// Изменить статус
function change_status(username, status, checked) {
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			temp_account = JSON.parse(accounts_settings[i]);
			temp_account.active_account = checked;
			temp_account.account_status = status;
			accounts_settings[i] = JSON.stringify(temp_account);
			localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
			dev_log('CH_ST', status);
			break
		}
	}
	/// Переавторизация
	if (status == 'переавторизуйтесь в аккаунт через бота' && bot_settings.use_relogin) {
		stat_log('Идёт переавторизация в аккаунт: '+username);
		temp_relogin_acc = username;
		for (var i = 0; i < accounts_settings.length; i++) {
			if (JSON.parse(accounts_settings[i]).username == username) {
				temp_account = accounts_settings[i];
				break
			}
		}
		temp_account = JSON.parse(temp_account);
		pywebview.api.check_account(temp_account.username, temp_account.password, '', temp_account.proxy, bot_settings.use_relogin_proxy, temp_account.user_agent, temp_account.api_key, true, [temp_account.tasks_follows, temp_account.tasks_likes, temp_account.tasks_comments]);
	} else {
		if (bot_settings.notify) pywebview.api.notify('Ошибка аккаунта', status);
		update_account_list();
	}
}

/// Изменить задания для выполнения
function change_tasks_compile(username, val) {
	for (var i = 0; i < accounts_settings.length; i++) {
		if (JSON.parse(accounts_settings[i]).username == username) {
			temp_account = JSON.parse(accounts_settings[i]);
			if (val == 'likes') {
				temp_account.tasks_likes = false;
			} else if (val == 'follows') {
				temp_account.tasks_follows = false;
			} else if (val == 'comments') {
				temp_account.tasks_comments = false;
			}
			if (!temp_account.tasks_follows && !temp_account.tasks_likes && !temp_account.tasks_comments) {
				temp_account.active_account = false;
				temp_account.account_status = 'временная блокировка';
			}
			accounts_settings[i] = JSON.stringify(temp_account);
			localStorage.setItem('accounts_settings', JSON.stringify(accounts_settings));
			dev_log('CH_TC', `${val} - false`);
			break
		}
	}
	update_account_list();
}

////////////////////////
//                    //
//   Настройки бота   //
//                    //
////////////////////////
function update_settings() {
	$('#delay_task').val(bot_settings.delay_task).mask("99 сек.");
	$('#delay_task_check').val(bot_settings.delay_task_check).mask("99 сек.");
	$('#sleep_task').val(bot_settings.sleep_task).mask("99 зад.");
	$('#sleep_time').val(bot_settings.sleep_time).mask("99 мин.");
	$('#account_change').val(bot_settings.account_change).mask("99 зад.");
	if (bot_settings.notify) $('#notify').prop("checked", true);
	if (bot_settings.use_sid) $('#use_sid').prop("checked", true);
	if (bot_settings.use_relogin) $('#use_relogin').prop("checked", true);
	if (bot_settings.use_proxy_task) $('#use_proxy_task').prop("checked", true);
	if (bot_settings.use_relogin_proxy) $('#use_relogin_proxy').prop("checked", true);

	stats_logs_update();

	$('#delay_task').on('change', function(){
		if ($(this).val() == '') $(this).val('02 сек.');
		else if (Number($(this).val().split(' ')[0]) < 2) $(this).val('02 сек.');
		bot_settings.delay_task = $(this).val();
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#delay_task_check').on('change', function(){
		if ($(this).val() == '') $(this).val('00 сек.');
		bot_settings.delay_task_check = $(this).val();
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#use_sid').on('change', function(){
		bot_settings.use_sid = $(this).prop("checked");
		pywebview.api.switch_sid(bot_settings.use_sid);
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#use_relogin').on('change', function(){
		bot_settings.use_relogin = $(this).prop("checked");
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#use_relogin_proxy').on('change', function(){
		bot_settings.use_relogin_proxy = $(this).prop("checked");
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#use_proxy_task').on('change', function(){
		bot_settings.use_proxy_task = $(this).prop("checked");
		pywebview.api.switch_proxy(bot_settings.use_proxy_task);
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#notify').on('change', function(){
		bot_settings.notify = $(this).prop("checked");
		if (bot_settings.notify) {
			pywebview.api.notify('Проверка', 'Уведомления включены!');
			alerts('<i class="uil uil-info-circle"></i> Проверочное уведомление отправлено! Если отсутствует, проверьте настройки системы/уведомлений');
		}
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#sleep_task').on('change', function(){
		if ($(this).val() == '') $(this).val('00 зад.');
		else if (Number($(this).val().split(' ')[0]) == 0) return;
		else if (Number($(this).val().split(' ')[0]) < 2) $(this).val('02 зад.');
		bot_settings.sleep_task = $(this).val();
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#sleep_time').on('change', function(){
		if ($(this).val() == '') $(this).val('00 мин.');
		bot_settings.sleep_time = $(this).val();
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});

	$('#account_change').on('change', function(){
		if ($(this).val() == '') $(this).val('00 зад.');
		else if (Number($(this).val().split(' ')[0]) == 0) return;
		else if (Number($(this).val().split(' ')[0]) < 2) $(this).val('02 зад.');
		bot_settings.account_change = $(this).val();
		localStorage.setItem('bot_settings', JSON.stringify(bot_settings));
	});
}

///////////////////////
//                   //
//    Запуск бота    //
//                   //
///////////////////////
function actuve_btn() {
	$('#start_bot').on('click', function() {
		if (bot_start) {
			bot_start = false;
			$(this).html('Запустить бота');
			clearInterval(stopwatch_interval);
			clearInterval(start_task_interval);
			clearInterval(check_task_interval);
			clearInterval(bot_sleep_interval);
			clearInterval(error_interval);
			stat_log('Бот ожидает вашего запуска');
			bot_workstation_action = 'auth_account';
		} else {
			if (temp_stat_accounts_count > 0) {
				bot_start = true;
				$(this).html('Остановить бота');
				stopwatch();
				bot_workstation('auth_account');
			} else alerts('<i class="uil uil-info-circle"></i> У вас отсутствуют активные аккаунты Instagram!')
		}
	});
}

///////////////////////
//                   //
//    Workstation    //
//                   //
///////////////////////
function bot_workstation(bot_workstation_action, err=false, delay=0) {
	if (bot_start) {
		/// Войти в аккаунт
		if (bot_workstation_action == 'auth_account') {
			if (temp_stat_accounts_count != 0){
				if (temp_stat_account_active > temp_stat_accounts_count) temp_stat_account_active = 1;
				for (var i = 0; i < accounts_settings.length; i++) {
					if (JSON.parse(accounts_settings[i]).username == $(`.account_username[id_acc="${temp_stat_account_active}"]`).html()) {
						temp_accounts_change = 0;
						active_accounts_id = i;
						pywebview.api.auth_account(accounts_settings[i]);
						stats_logs_update();
						break
					}
				}
			} else {
				bot_start = false;
				$('#start_bot').html('Запустить бота');
				clearInterval(stopwatch_interval);
				clearInterval(start_task_interval);
				clearInterval(check_task_interval);
				clearInterval(bot_sleep_interval);
				clearInterval(error_interval);
				bot_workstation_action = 'auth_account';
				if (bot_settings.notify) pywebview.api.notify('Бот остановлен', 'Отсутствуют активные аккаунты');
				stat_log('Отсутствуют активные аккаунты');
			}
		/// Получить задание
		} else if (bot_workstation_action == 'get_task') {
			stat_category = []
			stat_category_sort = []
			if (JSON.parse(accounts_settings[active_accounts_id]).tasks_follows) {
				stat_category.push('подписки');
				stat_category_sort.push('2');
			}
			if (JSON.parse(accounts_settings[active_accounts_id]).tasks_likes) {
				stat_category.push('лайки');
				stat_category_sort.push('1');
			}
			if (JSON.parse(accounts_settings[active_accounts_id]).tasks_comments) {
				stat_category.push('комментарии');
				stat_category_sort.push('6');
			}
			stat_category = stat_category.join(', ');
			stat_category_sort = stat_category_sort.join(',');
			stats_logs_update();
			stat_log(`Получаю задание на ${stat_category}`);
			setTimeout(function() {
				pywebview.api.get_tasks(stat_category_sort);
			}, 1000);
		/// Выполнить задание
		} else if (bot_workstation_action == 'start_task') {
			delay = Number(bot_settings.delay_task.split(' ')[0]);
			delay_temp = 0;
			if (delay > 1) {
				stat_log(`Задание получено, жду ${delay} сек. перед выполнением`);
				start_task_interval = setInterval(function() {
					if (delay_temp == delay - 1) {
						clearInterval(start_task_interval);
						pywebview.api.start_task();
					} else {
						if (bot_start) {
							delay_temp++;
							stat_log(`Задание получено, жду ${delay - delay_temp} сек. перед выполнением`);
						} else clearInterval(start_task_interval);
					}
				}, 1000);
			} else pywebview.api.start_task();
		/// Проверить задание
		} else if (bot_workstation_action == 'check_task') {
			delay = Number(bot_settings.delay_task_check.split(' ')[0]);
			delay_temp = 0;
			if (delay > 1) {
				stat_log(`Задание выполнено, жду ${delay} сек. перед проверкой`);
				check_task_interval = setInterval(function() {
					if (delay_temp == delay - 1) {
						clearInterval(check_task_interval);
						pywebview.api.check_task();
					} else {
						if (bot_start) {
							delay_temp++;
							stat_log(`Задание выполнено, жду ${delay - delay_temp} сек. перед проверкой`);
						} else clearInterval(check_task_interval);
					}
				}, 1000);
			} else pywebview.api.check_task();
		/// Задание выполнено
		} else if (bot_workstation_action == 'task_true') {
			temp_bot_sleep++;
			stat_tasks_true++;
			temp_tasks_error = 0;
			temp_accounts_change++;
			stats_logs_update();
			val = Number(bot_settings.account_change.split(' ')[0]);
			val2 = Number(bot_settings.sleep_task.split(' ')[0]);
			val2_time = Number(bot_settings.sleep_time.split(' ')[0]);
			val2_time_temp = 0;
			/// Смена аккаунта
			if (temp_accounts_change >= val && val != 0 && temp_stat_accounts_count > 1) {
				if (temp_stat_account_active + 1 <= temp_stat_accounts_count) temp_stat_account_active++;
				else temp_stat_account_active = 1;
				bot_workstation('auth_account');
			/// Сон
			} else if (temp_bot_sleep + 1 >= val2 && val2 != 0 && val2_time != 0) {
				temp_bot_sleep = 0;
				stat_log(`Бот ушел в сон после выполнения ${val2} зад. на ${val2_time} мин.`);
				bot_sleep_interval = setInterval(function() {
					if (bot_start) {
						if (val2_time_temp == val2_time - 1) {
							clearInterval(bot_sleep_interval);
							bot_workstation('auth_account');
						} else {
							val2_time_temp++;
							stat_log(`Бот ушел в сон после выполнения ${val2} зад. на ${val2_time - val2_time_temp} мин.`);
						}
					} else clearInterval(bot_sleep_interval);
				}, 60000);
			} else bot_workstation('get_task');
		/// Ошибка задания
		} else if (bot_workstation_action == 'error') {
			delay_temp = 0;
			temp_bot_sleep++;
			stat_tasks_false++;
			temp_tasks_error++;
			temp_accounts_change++;
			stats_logs_update();
			/// Частые ошибки
			if (temp_tasks_error >= 6) {
				delay = 5;
				stat_log(`Слишком частые ошибки, жду ${delay} мин.`);
				error_interval = setInterval(function() {
					if (delay_temp == delay - 1) {
						clearInterval(error_interval);
						temp_tasks_error = 0;
						temp_stat_account_active = 1;
						bot_workstation('auth_account');
					} else {
						if (bot_start) {
							delay_temp++;
							if (bot_settings.notify) pywebview.api.notify('Бот ушел в сон', 'Слишком частые ошибки');
							stat_log(`Слишком частые ошибки, жду ${delay - delay_temp} мин.`);
						} else clearInterval(error_interval);
					}
				}, 60000);
			/// Таймер
			} else {
				stat_log(`Произошла ошибка: ${err}, жду ${delay} сек.`);
				error_interval = setInterval(function() {
					if (delay_temp == delay - 1) {
						clearInterval(error_interval);
						bot_workstation('get_task');
					} else {
						if (bot_start) {
							delay_temp++;
							stat_log(`Произошла ошибка ${err}, жду ${delay - delay_temp} сек.`);
						} else clearInterval(error_interval);
					}
				}, 1000);
			}
		}
	/// Остановка бота
	} else {
		bot_start = false;
		$(this).html('Запустить бота');
		clearInterval(stopwatch_interval);
		clearInterval(start_task_interval);
		clearInterval(check_task_interval);
		clearInterval(bot_sleep_interval);
		clearInterval(error_interval);
		bot_workstation_action = 'auth_account';
		stat_log('Бот ожидает вашего запуска');
	}
}

////////////////////////
//                    //
//      Лог бота      //
//                    //
////////////////////////
function stat_log(data) {
	$('#stat_log').html(data);
	dev_log('LOG', data);
}

/// Лог разработчика
function dev_log(p, data, json=null) {
	if (dev_logs.length >= 250) dev_logs.shift();
	if (json != null) dev_logs.push($('#stat_time').html()+` - ${p} - ${data}, ${JSON.stringify(json)}`);
	else dev_logs.push($('#stat_time').html()+` - ${p} - ${data}`);
}

/// Скачать лог разработчика
$('#dev_downl').on('click', function() {
	data = dev_logs.join('\n');
	pywebview.api.dev_downl(data);
});

function stats_logs_update() {
	$('#stat_eaned_money').html(`${stat_eaned_money.toFixed(2)}₽`);
	$('#stat_eaned_coins').html(`${stat_eaned_coins}`);
	$('#stat_tasks').html(stat_tasks_true+'/'+stat_tasks_false);
	$('#stat_category').html(stat_category.indexOf(',') != -1 ? "все задания" : stat_category == "лайки" ? "только лайки" : stat_category);
	$('#stat_accounts_count').html(temp_stat_account_active+'/'+temp_stat_accounts_count);
} 

/// Подсчет монет
function money_status(b_coins, b_money) {
	stat_eaned_money = stat_eaned_money + b_money
	stat_eaned_coins = stat_eaned_coins + b_coins;
	stats_logs_update();
}

///////////////////////
//                   //
//    Секундомер     //
//                   //
///////////////////////
function stopwatch() {
	stopwatch_interval = setInterval(function() {
		if (bot_start) {
			stopwatch_time++;
			stopwatch_time_sec++;
			/// Минуты
			if (stopwatch_time%60 == 0 && stopwatch_time != 0) {
				stopwatch_time_sec = 0;
				stopwatch_time_min++;
			}
			/// Часы
			if (stopwatch_time_min%60 == 0 && stopwatch_time_min != 0) {
				stopwatch_time_sec = 0;
				stopwatch_time_min = 0;
				stopwatch_time_hor++;
			}
			$('#stat_time').html(`${stopwatch_time_hor < 10 ? "0" + stopwatch_time_hor : stopwatch_time_hor}:${stopwatch_time_min < 10 ? "0" + stopwatch_time_min : stopwatch_time_min}:${stopwatch_time_sec < 10 ? "0" + stopwatch_time_sec : stopwatch_time_sec}`);
		}
	}, 1000);
}

///////////////////////
//                   //
// Версия приложения //
//                   //
///////////////////////
function ver_application(ver, mess) {
	$('#ver').html(ver);
	if (mess == '') {
		$('#start_bot').html('Запустить бота');
		actuve_btn();
	} else {
		stat_log(mess);
		$('#start_bot').html('Обновите приложение для запуска бота!');
		alerts('<i class="uil uil-info-circle"></i> '+mess+' --15--');
	}
}

//////////////////////
//                  //
//  Имп/Эксп акков  //
//                  //
//////////////////////
function export_acc() {
	accounts_settings = localStorage.getItem('accounts_settings');
	console.log(accounts_settings)
}

function import_acc() {

}
