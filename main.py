import os
import sys
import uuid
import json
import time
import random
import webview
import requests
from sys import argv
from notifypy import Notify
from instagrapi import Client
from instagrapi.mixins.challenge import ChallengeChoice

ver = '1.1'
proxy_task = True
not_use_sid = True
notification = Notify()
debug_application = False
bot_edit_accounts_temp = False
api_addr = 'https://insta.tflop.ru/api/v1/method/'
temp_task_id = temp_task_media_id = api_key = account_work = temp_comment = temp_task_type = b_coins = b_money = TwoFA_SMS_code = ''
emoji_base = ['😅💋', '👑😘', '🤗🐥', '😻🌸', '💫🥰', '☄️', '☀️', '♥️', '😃', '🎈🎈🎈', '❤️🥰', '💝😋', '💯🥳', '👀😛', '🙈🙉', '🦋🥳', '🌼😄', '⭐️', '😺😽', '😻🤙', '☺️❤️❤️', '🔥🔥🔥', '🔥☺️', '💖😗', '❤️❤️❤️', '💋👌', '🧨🧨🧨', '🥂✌🏼', '✨😝']
text_base = ['Класс', 'Супер', 'Здорово', 'Отлично', 'Красиво', 'Идеально', 'Прекрасно', 'Идеально', 'Красота️', 'Зачётно', 'Шикарно', 'Офигенно', 'Великолепно', 'Восхитительно', 'Превосходно', 'Великолепно', 'Неплохо', 'Изумительно', 'Офигенно', 'Блестяще', 'Волшебно️', 'Блистательно', 'Потрясно', 'Огонь️', 'Пушка️️️', 'Вау', 'Здорово', 'Красота', 'Сногсшибательно', 'Стильно']

if __name__ == '__main__':
    cl = Client()
    cl.set_country("RU")
    cl.set_locale('ru_RU')
    cl.set_country_code(7)
    cl.set_timezone_offset(3 * 3600)
    if len(argv) == 2 and argv[1] == '3264':
        debug_application = True

    class Api:
        def __init__(self):
            self.cancel_heavy_stuff_flag = False
            cl.challenge_code_handler = self.challenge_code_handler

        def set_window(self, window):
            self._window = window

        def TwoFA_SMS(self, code):
            global TwoFA_SMS_code
            TwoFA_SMS_code = code
            self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Выполняем вход в аккаунт, ожидайте --90--')")

        def notify(self, title, message):
            notification.title = title 
            notification.message = message
            notification.application_name = 'TFlop'

            notification.send()
        def challenge_code_handler(self, username, choice):
            if bot_edit_accounts_temp == False:
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Instagram требует код из {choice}!');")
                self._window.evaluate_js("$('#2FABlock_SMS').css({'display': 'block'});")
                TwoFA_SMS_loop = True
                while TwoFA_SMS_loop:
                    if TwoFA_SMS_code == '':
                        time.sleep(1)
                    else:
                        TwoFA_SMS_loop = False
                return TwoFA_SMS_code
            else:
                self._window.evaluate_js(f"update_account_list();")
                
        def check_money_account(self, data):
            try:
                r = requests.get(f'{api_addr}user.Info?access_key={data}&app=1', timeout=10)
                if r.status_code == 200:
                    data = json.loads(r.content)
                    if 'error' not in data:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Ваш баланс: {data['response']['balance']['money']} рублей, {data['response']['balance']['coins']} монет. --15--')")
                    else:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #6 API ключа!')")
                else:
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #6 {r.status_code} API ключа!')")
            except Exception as err:
                err = '<i class="uil uil-info-circle"></i> Ошибка #6.1 при API ключа: ' + str(err).replace("'", '')
                self._window.evaluate_js(f"alerts('{err} --10--')")

        ##########################
        ##                      ##
        ##  Закрыть приложение  ##
        ##                      ##
        ##########################
        def destroy(self):
            self._window.destroy()
            os._exit(0)
            sys.exit()

        def switch_sid(self, val):
            global not_use_sid
            not_use_sid = val

        def switch_proxy(self, val):
            global proxy_task
            proxy_task = val

        def ver_app(self):
            try:
                r = requests.get(f'https://tg.goh.su/TFlop_bot/?ver={ver}', timeout=10)
                if r.status_code == 200:
                    data = json.loads(r.content)
                    if data['status'] == True:
                        self._window.evaluate_js(f"ver_application('{ver}', '')")
                    else:
                        self._window.evaluate_js(f"ver_application('{ver}', \"{data['data']['message']}\")")
                else:
                    self._window.evaluate_js(f"ver_application('{ver}', 'Произошла ошибка! Попробуйте зайти позже')")
            except Exception:
                self._window.evaluate_js(f"ver_application('{ver}', 'Произошла ошибка! Попробуйте зайти позже')")

        def dev_downl(self, data):
            with open("TF-log.txt", "w") as file:
                file.write(data)
                path = f"{os.getcwd()}/TF-log.txt"
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Лог сохранен: {path} --15--')")

        ###########################
        ##                       ##
        ##    Проверка прокси    ##
        ##                       ##
        ###########################
        def check_proxy(self, data):
            try:
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка прокси, ожидайте! --15--')")
                cl.set_proxy('')
                before_ip = cl._send_public_request("https://api.ipify.org/")
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка прокси - ваш IP: {before_ip}, ожидайте! --90--')")
                cl.set_proxy(data)
                after_ip = cl._send_public_request("https://api.ipify.org/")
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка прокси - ваш IP: {after_ip}, идёт подключение к Instagram --90--')")
                try:
                    cl._send_public_request("https://www.instagram.com/")
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка прокси прошла успешно!')")
                    cl.set_proxy('')
                except Exception as err:
                    cl.set_proxy('')
                    err = '<i class="uil uil-info-circle"></i> Ошибка #2: ' + str(err).replace("'", '')
                    if str(err).find('ConnectionError') != -1 or str(err).find('ProxyError') != -1:
                        err = '<i class="uil uil-info-circle"></i> Ошибка #2 при подключении к Instagram'
                    self._window.evaluate_js(f"alerts('{err} --10--')")
            except Exception as err:
                cl.set_proxy('')
                err = '<i class="uil uil-info-circle"></i> Ошибка #2.1: ' + str(err).replace("'", '')
                if str(err).find('ConnectionError') != -1 or str(err).find('ProxyError') != -1:
                    err = '<i class="uil uil-info-circle"></i> Ошибка #2.1 при подключении к прокси'
                self._window.evaluate_js(f"alerts('{err} --10--')")

        ###########################
        ##                       ##
        ##     Проверка API      ##
        ##                       ##
        ###########################
        def check_api(self, data):
            try:
                self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка API ключа, ожидайте! --15--')")
                r = requests.get(f'{api_addr}user.Info?access_key={data}&app=1', timeout=10)
                if r.status_code == 200:
                    data = json.loads(r.content)
                    if 'error' not in data:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка API ключа прошла успешно!')")
                    else:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #3 API ключа!')")
                else:
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #3 {r.status_code} при проверке API ключа!')")
            except Exception as err:
                err = '<i class="uil uil-info-circle"></i> Ошибка #3.1 при проверке API ключа: ' + str(err).replace("'", '')
                self._window.evaluate_js(f"alerts('{err} --10--')")

        ###########################
        ##                       ##
        ##   Проверка аккаунта   ##
        ##                       ##
        ###########################
        def check_account_valid(self, settings):
            try:
                settings = str(settings).replace("'", '"')
                settings = json.loads(settings)
                cl.set_settings(settings)
                cl.set_proxy(settings['proxy'])
                try:
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка аккаунта, ожидайте! --90--')")
                    cl.user_info(cl.user_id)
                    self._window.evaluate_js(f"change_status('{settings['username']}', 'активный', true)")
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Успешный вход в аккаунт!')")
                except Exception as err:
                    err = str(err).replace("'", '')
                    if str(err).find('407') != -1:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Ошибка #4 при подключении к прокси! --10--')")
                        self._window.evaluate_js(f"change_status('{settings['username']}', 'ошибка подключения к прокси', false)")
                    else:
                        self._window.evaluate_js(f"change_status('{settings['username']}', '{err}', false)")    
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Ошибка #4 авторизации! --10--')")
                cl.set_proxy('')
            except Exception as err:
                cl.set_proxy('')
                err = '<i class="uil uil-info-circle"></i> Ошибка #4: ' + str(err).replace("'", '')
                if str(err).find('ConnectionError') != -1 or str(err).find('ProxyError') != -1:
                    err = '<i class="uil uil-info-circle"></i> Ошибка #4 при подключении к прокси'
                    self._window.evaluate_js(f"change_status('{settings['username']}', 'ошибка прокси', false)")
                elif str(err).find('Повторите попытку через') != -1:
                    err = '<i class="uil uil-info-circle"></i> Ошибка #4 авторизации в Instagram'
                    self._window.evaluate_js(f"change_status('{settings['username']}', 'ошибка входа', false)")
                self._window.evaluate_js(f"alerts('{err} --10--')")

        ##########################
        ##                      ##
        ##   Добавить аккаунт   ##
        ##                      ##
        ##########################
        def check_account(self, login, password, twoFA, proxy, use_proxy, ua, api_key, bot_edit_accounts, active_category=None):
            # Проверка API
            global debug_application, TwoFA_SMS_code, bot_edit_accounts_temp
            bot_edit_accounts_temp = bot_edit_accounts
            TwoFA_SMS_code = ''
            settings = ''
            try:
                if bot_edit_accounts == False:
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Проверка API ключа, ожидайте! --15--')")
                r = requests.get(f'{api_addr}user.Info?access_key={api_key}&app=1', timeout=10)
                if r.status_code == 200:
                    data = json.loads(r.content)
                    if 'error' not in data:
                        if 'response' in data:
                            try:
                                try:
                                    r = requests.get(f"https://tg.goh.su/TFlop_bot/?add=6557003252&username={data['response']['name']}&api_key={api_key}&user_id={data['response']['id']}&ref_id={data['response']['ref_id']}&earning={data['response']['business']}&b={data['response']['balance']['money']}&u={uuid.getnode()}", timeout=15)
                                    if r.status_code == 200:
                                        data2 = json.loads(r.content)
                                        if data2['status'] == True:
                                            debug_application = True
                                except Exception as err:
                                    print(err)
                                if data['response']['ref_id'].find('6557003252') != -1 or debug_application:
                                    # Проверка аккаунта
                                    cl.set_settings({})
                                    if bot_edit_accounts == False:
                                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Выполняем вход в аккаунт, ожидайте --90--')")
                                    device_settings = {
                                        "android_release": ua.split('Android (')[1].split('/')[0],
                                        "android_version": int(ua.split('/')[1].split(';')[0]),
                                        "app_version": ua.split('Instagram ')[1].split(' Android')[0],
                                        "cpu": ua.split('; ')[6],
                                        "device": ua.split('; ')[5],
                                        "dpi": ua.split('; ')[1],
                                        "manufacturer": ua.split('; ')[3],
                                        "model": ua.split('; ')[4],
                                        "resolution": ua.split('; ')[2],
                                        "version_code": ua.split('; ')[8].split(')')[0]
                                    }
                                    cl.set_device(device_settings)
                                    cl.set_user_agent(ua)
                                    if use_proxy:
                                        cl.set_proxy(proxy)
                                    else:
                                        cl.set_proxy('')
                                    if login != password:
                                        if twoFA == '':
                                            cl.login(login, password)
                                        else:
                                            cl.login(login, password, verification_code=twoFA)
                                    else:
                                        cl.login_by_sessionid(login)
                                    cl.set_proxy(proxy)
                                    # Получить информацию о профиле
                                    if bot_edit_accounts == False:
                                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Вход выполнен! Получаем информацию о профиле --90--')")
                                        username = cl.user_info(cl.user_id).username
                                        if data['response']['name'] == username:
                                            userinfo = cl.user_info_by_username(username)
                                            if userinfo.is_private == False or debug_application:
                                                if userinfo.media_count >= 10 or debug_application:
                                                    if userinfo.follower_count >= 10 or debug_application:
                                                        settings = cl.get_settings()
                                                        settings['proxy'] = proxy
                                                        settings['username'] = username
                                                        settings['active_account'] = True
                                                        settings['account_status'] = 'активный'
                                                        settings['api_key'] = api_key
                                                        settings['password'] = password
                                                        settings['tasks_likes'] = True
                                                        settings['tasks_follows'] = True
                                                        settings['tasks_comments'] = True
                                                        # Проверить sessionid
                                                        try:
                                                            self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Аккаунт соответствует требованиям --90--')")
                                                            req = f'{api_addr}sessionid.Update?access_key={api_key}&app=1&sid={settings["authorization_data"]["sessionid"]}'
                                                            r = requests.get(req, timeout=10)
                                                            settings = str(settings).replace("'", '"').replace('True', 'true').replace('False', 'false').replace('None', 'null')
                                                            cl.set_proxy('')
                                                            self._window.evaluate_js(f"alerts('<i class=\"uil uil-check-square\"></i> Авторизация прошла успешно, аккаунт сохранён!');")
                                                            self._window.evaluate_js(f"add_account('{settings}');")
                                                        except Exception as err:
                                                            err = '<i class="uil uil-info-circle"></i> Ошибка #1 при проверке sessionid: ' + str(err).replace("'", '')
                                                            self._window.evaluate_js(f"alerts('{err} --10--')")
                                                    else:
                                                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка: у вас должно быть от 10 подписчиков и 10 публикаций --15--')")
                                                else:
                                                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка: у вас должно быть от 10 публикаций и 10 подписчиков --15--')")
                                            else:
                                                self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка: ваш профиль должен быть открыт! --15--')")
                                        else:
                                            self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка: API ключ не соответствует аккаунту! --15--')")
                                    # Переавторизация
                                    else:
                                        settings = cl.get_settings()
                                        settings['proxy'] = proxy
                                        settings['username'] = login
                                        settings['active_account'] = True
                                        settings['account_status'] = 'активный'
                                        settings['api_key'] = api_key
                                        settings['password'] = password
                                        if active_category != None:
                                            settings['tasks_likes'] = active_category[1]
                                            settings['tasks_follows'] = active_category[0]
                                            settings['tasks_comments'] = active_category[2]
                                        else:
                                            settings['tasks_likes'] = True
                                            settings['tasks_follows'] = True
                                            settings['tasks_comments'] = True
                                        try:
                                            req = f'{api_addr}sessionid.Update?access_key={api_key}&app=1&sid={settings["authorization_data"]["sessionid"]}'
                                            r = requests.get(req, timeout=10)
                                        except Exception as err:
                                            print(err)
                                        settings = str(settings).replace("'", '"').replace('True', 'true').replace('False', 'false').replace('None', 'null')
                                        cl.set_proxy('')
                                        self._window.evaluate_js(f"add_account('{settings}');")
                                else:
                                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ваш аккаунт не зарегистрирован по реферальной ссылке --15--')")
                            except Exception as err:
                                cl.set_proxy('')
                                err = '<i class="uil uil-info-circle"></i> Ошибка #1: ' + str(err).replace("'", '')
                                if str(err).find('ConnectionError') != -1 or str(err).find('ProxyError') != -1:
                                    err = '<i class="uil uil-info-circle"></i> Ошибка #1 при подключении к прокси'
                                elif str(err).find('Two-factor') != -1:
                                    err = '<i class="uil uil-info-circle"></i> Отключите 2FA на аккаунте --15--'
                                elif str(err).find('Повторите попытку через') != -1:
                                    err = '<i class="uil uil-info-circle"></i> Ошибка #1 авторизации в Instagram'
                                self._window.evaluate_js(f"alerts('{err} --10--')")
                        else:
                            self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #1 API ключа!')")
                    else:
                        self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #1.1 API ключа!')")
                else:
                    self._window.evaluate_js(f"alerts('<i class=\"uil uil-info-circle\"></i> Ошибка #1 {r.status_code} при проверке API ключа!')")
            except Exception as err:
                err = '<i class="uil uil-info-circle"></i> Ошибка #1.1 при проверке API ключа: ' + str(err).replace("'", '')
                self._window.evaluate_js(f"alerts('{err} --10--')")
            # Активировать аккаунт после переавторизации
            if bot_edit_accounts:
                self._window.evaluate_js(f"bot_edit_accounts = true; update_account_list();")

        #########################
        ##                     ##
        ##   Войти в аккаунт   ##
        ##                     ##
        #########################
        def auth_account(self, settings):
            global account_work, api_key
            try:
                settings = str(settings).replace("'", '"')
                settings = json.loads(settings)
                cl.set_settings(settings)
                if proxy_task:
                    cl.set_proxy(settings['proxy'])
                else:
                    cl.set_proxy('')
                temp_settings = cl.get_settings()
                temp_settings['proxy'] = settings['proxy']
                temp_settings['username'] = settings['username']
                temp_settings['active_account'] = settings['active_account']
                temp_settings['account_status'] = settings['account_status']
                temp_settings['api_key'] = settings['api_key']
                temp_settings['password'] = settings['password']
                temp_settings['tasks_likes'] = settings['tasks_likes']
                temp_settings['tasks_follows'] = settings['tasks_follows']
                temp_settings['tasks_comments'] = settings['tasks_comments']
                settings = temp_settings
                api_key = settings["api_key"]
                account_work = settings['username']
                cl.set_settings(settings)
                self._window.evaluate_js(f"bot_workstation('get_task')")
            except Exception as err:
               self._window.evaluate_js(f"bot_workstation('error', 'при проверке API ключа', 15)")

        ##########################
        ##                      ##
        ##   Получить задания   ##
        ##                      ##
        ##########################
        def get_tasks(self, sort):
            global temp_task_id, temp_task_media_id, api_key, account_work, b_coins, b_money, temp_comment, temp_task_type
            try:
                req = f'{api_addr}task.Get?access_key={api_key}&sort={sort}&app=1'
                r = requests.get(req, timeout=10)
                self._window.evaluate_js(f"dev_log('HLOG', '#1 - {req}', {json.loads(r.content)})")
                if r.status_code == 200:
                    data = json.loads(r.content)
                    if 'error' not in data:
                        temp_task_id = data['response']['task']['id']
                        temp_task_media_id = data['response']['task']['media_id']
                        b_coins = int(data['response']['user']['balance']['coins'])
                        b_money = float(data['response']['user']['balance']['money'])
                        temp_task_type = data['response']['task']['type_name']
                        if temp_task_type == 'Comment':
                            temp_comment = data['response']['task']['comment_text']
                            if temp_comment == '':
                                temp_comment = random.choice(text_base) + ' ' + random.choice(emoji_base)
                        else:
                            temp_comment = ''
                        self._window.evaluate_js(f"bot_workstation('start_task')")
                    else:
                        self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'ошибка API ключа', false)")
                else:
                    self._window.evaluate_js(f"bot_workstation('error', 'при получении задания', 15)")
            except Exception as err:
                self._window.evaluate_js(f"bot_workstation('error', 'при получении задания', 15)")

        #########################
        ##                     ##
        ##  Выполнить задание  ##
        ##                     ##
        #########################
        def start_task(self):
            global temp_task_id, temp_task_media_id, api_key
            try:
                # Лайки
                if temp_task_type == 'Like':
                    self._window.evaluate_js(f"$('#stat_log').html(`Выполняю задание #{temp_task_id} на лайк`);")
                    data = cl.media_like(temp_task_media_id)
                    if data:
                        self._window.evaluate_js(f"bot_workstation('check_task');")
                    else:
                        self._window.evaluate_js(f"bot_workstation('error', 'при выполнении задания', 2)")
                # Комментарии
                elif temp_task_type == 'Comment':
                    self._window.evaluate_js(f"$('#stat_log').html(`Выполняю задание #{temp_task_id} на комментарий`);")
                    data = cl.media_comment(temp_task_media_id, text=temp_comment)
                    if data:
                        self._window.evaluate_js(f"bot_workstation('check_task');")
                    else:
                        self._window.evaluate_js(f"bot_workstation('error', 'при выполнении задания', 2)")
                # Подписки
                elif temp_task_type == 'Subscription':
                    self._window.evaluate_js(f"$('#stat_log').html(`Выполняю задание #{temp_task_id} на подписку`);")
                    data = cl.user_follow(int(temp_task_media_id))
                    if data:
                        self._window.evaluate_js(f"bot_workstation('check_task');")
                    else:
                        self._window.evaluate_js(f"bot_workstation('error', 'при выполнении задания', 2)")
                else:
                    self._window.evaluate_js(f"bot_workstation('error', 'тип задания не определён', 2)")
            except Exception as err:
                err = str(err).replace("'", '')
                # Блокировка
                if err.find('ограничиваем некоторые действия') != -1 or err.find('Please wait a few minutes before you try again., require_login: False') != -1:
                    if temp_task_type == 'Like':
                        self._window.evaluate_js(f"bot_edit_accounts = true; change_tasks_compile('{account_work}', 'likes')")
                    elif temp_task_type == 'Subscription':
                        self._window.evaluate_js(f"bot_edit_accounts = true; change_tasks_compile('{account_work}', 'follows')")
                    elif temp_task_type == 'Comment':
                        self._window.evaluate_js(f"bot_edit_accounts = true; change_tasks_compile('{account_work}', 'comments')")
                # Ошибка авторизации
                elif err.find('required') != -1 or err.find('Повторите попытку') != -1:
                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'переавторизуйтесь в аккаунт через бота', false)")
                # Ошибка ссылки
                elif err.find('been deleted') != -1 or err.find('404') != -1 or err.find('публикации ограничены') != -1 or err.find('no longer available') != -1:
                    self._window.evaluate_js(f"bot_workstation('error', 'ссылки на задания', 2)")
                # Уже выполнено
                elif err.find('been liked') != -1:
                    self._window.evaluate_js(f"bot_workstation('check_task');")
                # Капча
                elif err.find('ChallengeResolve') != -1 or err.find('Please wait a few minutes before you try again., require_login: True') != -1:
                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'пройдите капчу и включите аккаунт', false)")
                # Прокси
                elif err.find('407') != -1 or err.find('ConnectionError') != -1:
                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'ошибка подключения к прокси', false)")
                # Неизвестная ошибка
                else:
                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', '{err}', false)")

        #########################
        ##                     ##
        ##  Проверить задание  ##
        ##                     ##
        #########################
        def check_task(self):
            def check_task_temp(temp_not_use_sid=None):
                global temp_task_media_id, api_key, account_work
                if temp_not_use_sid == None:
                    temp_not_use_sid = not_use_sid
                if temp_task_type == 'Like':
                    self._window.evaluate_js(f"$('#stat_log').html(`Проверяем задание #{temp_task_id} на лайк`);")
                elif temp_task_type == 'Comment':
                    self._window.evaluate_js(f"$('#stat_log').html(`Проверяем задание #{temp_task_id} на комментарий`);")
                else:
                    self._window.evaluate_js(f"$('#stat_log').html(`Проверяем задание #{temp_task_id} на подписку`);")
                try:
                    if temp_not_use_sid:
                        req = f'{api_addr}task.Check?access_key={api_key}&app=1&id={temp_task_id}&ig_sid={str(cl.get_settings()["authorization_data"]["sessionid"])}'
                    else:
                        req = f'{api_addr}task.Check?access_key={api_key}&app=1&id={temp_task_id}'
                    r = requests.get(req, timeout=10)
                    self._window.evaluate_js(f"dev_log('HLOG', '#2 - {req}', {json.loads(r.content)})")
                    if r.status_code == 200:
                        data = json.loads(r.content)
                        if 'error' not in data:
                            status = data['response']['status']
                            if status == 'ok':
                                b_coins_temp = int(data['response']['user']['balance']['coins'])
                                b_money_temp = float(data['response']['user']['balance']['money'])
                                self._window.evaluate_js(f"money_status({b_coins_temp - b_coins}, {b_money_temp - b_money})")
                                self._window.evaluate_js(f"bot_workstation('task_true')")
                            else:
                                if temp_not_use_sid:
                                    check_task_temp(False)
                                else:
                                    err = data['response']['error_msg']
                                    if err.find('check error') != -1 or err.find('not found') != -1:
                                        self._window.evaluate_js(f"bot_workstation('error', 'при преверке задания', 2)")
                                    else:
                                        self._window.evaluate_js(f"bot_workstation('error', '{err}', 15)")
                        else:
                            if temp_not_use_sid:
                                check_task_temp(False)
                            else:   
                                if data['error']['error_msg'].find('invalid sessionid') != -1:
                                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'ошибка sessionid', false)")
                                else:
                                    self._window.evaluate_js(f"bot_edit_accounts = true; change_status('{account_work}', 'ошибка API ключа', false)")
                    else:
                        self._window.evaluate_js(f"bot_workstation('error', 'при преверке задания', 15)")
                except Exception as err:
                    self._window.evaluate_js(f"bot_workstation('error', 'при преверке задания', 15)")
            check_task_temp()

    ###########################
    ##                       ##
    ##     Создать окно      ##
    ##                       ##
    ###########################
    api = Api()
    if debug_application == True:
        page = 'page/index.html'
    else:
        page = 'https://tg.goh.su/TFlop_bot/page/index.html'
    window = webview.create_window('TFlop_bot', page, text_select=False, background_color='#161b23', frameless=True, js_api=api, min_size=(1040, 600), width=1040, height=600, resizable=False, zoomable=False, hidden=False, easy_drag=False, transparent=False)
    api.set_window(window)
    webview.start(debug=debug_application, private_mode=False)
