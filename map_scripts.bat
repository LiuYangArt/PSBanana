@echo off
chcp 65001
echo 输入版本号，例如: 2023
echo Input version, for example: 2023
set /P version=version: 
PAUSE



mklink /j "C:\Program Files\Adobe\Adobe Photoshop %version%\Presets\Scripts\PSBanana" "E:\SF_ActiveDocs\PSBanana"


pause