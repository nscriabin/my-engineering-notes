# Windows

Throughout my career, I had "immense pleasure" to develop purely on a Windows platform (without WSL). This happened in large enterprises (where only Windows is used) and on projects that could only run only on Windows because some dependencies were only working on Windows.

If I will ever have to do it again (without committing suicide), the below information will be useful!

## Shortcuts

- `Alt + F4` - close window
- `Ctrl+Shift+(+)` - Zoom in. Instead of a last (+) can use mouse wheel.
- `Ctrl+Shift+(-)` - Zoom out. Instead of a last (-) can use mouse wheel.
- `Win + D` - Show desktop. Pressing this combo again will show the last window.
- `Win + Tab` - Show all windows for quick switching.
- `Win + (up arrow)` - maximises window.
- `Win + (down arrow)` - minimises window.

In Chrome:

- `Ctrl + Tab` - moves to next tab.
- `Ctrl + Shift + Tab` - moves to previous tab.

## Aliases for git

Firstly, install [Git for Windows](https://gitforwindows.org/).

Aliases for Powershell commands:
- Setting [aliases](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/set-alias?view=powershell-7.4)
- Saving aliases to [profile](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.4) akin to `.zshrc`.
  - Execute `notepad $PROFILE` to edit the profile file.
- Allowing functions (and aliases) to take a [parameter](https://seankilleen.com/2020/04/how-to-create-a-powershell-alias-with-parameters/)

```
Function fn_gpo([string]$branch_name) {git push origin "$branch_name"}
Function fn_gpod([string]$branch_name)  {git push origin --delete "$branch_name"}
Function fn_gca {git commit --amend}
Function fn_gco([string]$branch_name) {git checkout "$branch_name"}
Function fn_gcob([string]$branch_name) {git checkout -b $branch_name}
Function fn_gcom([string]$commit_message) {git commit -m "$commit_message"}
Function fn_gri([int]$nc) {git rebase -i HEAD~$nc}
Function fn_gbd([string]$branch_name) {git branch -D "$branch_name"}
Function fn_gpu {git pull}
Function fn_gaa {git add -A}
Function fn_gs {git status}
Function fn_gb {git branch}
Function fn_glog {git log}
Function fn_glogo {git log --oneline}
Function fn_grm {git rebase main}
Function fn_activate {venv/Scripts/activate}

Set-Alias -Name gpo -Value fn_gpo
Set-Alias -Name gpod -Value fn_gpod
Set-Alias -Name gca -Value fn_gca
Set-Alias -Name gco -Value fn_gco
Set-Alias -Name gcob -Value fn_gcob
Set-Alias -Name gcom -Value fn_gcom
Set-Alias -Name gri -Value fn_gri
Set-Alias -Name gbd -Value fn_gbd
Set-Alias -Name gpu -Value fn_gpu
Set-Alias -Name gaa -Value fn_gaa
Set-Alias -Name gs -Value fn_gs
Set-Alias -Name gb -Value fn_gb
Set-Alias -Name glog -Value fn_glog
Set-Alias -Name glogo -Value fn_glogo
Set-Alias -Name grm -Value fn_grm
Set-Alias -Name activate -Value fn_activate
```

## Adjusting PYTHONPATH

To execute scripts which import a module from another local directory - adjust your `PYTHONPATH` to include the project directory:

```powershell
$old_python_path = [System.Environment]::GetEnvironmentVariable("PYTHONPATH", "User")
$new_python_path = "C:\Users\yourname\Desktop\reponame;" + $old_python_path
[System.Environment]::SetEnvironmentVariable('PYTHONPATH', $new_python_path, 'User')
```