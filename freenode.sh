#    freenode.sh - batch file used to connect bot to Freenode
#    Copyright (C) 2020  William R. Moore <caranmegil@gmail.com>
#
#    This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <https://www.gnu.org/licenses/>.

export HOST=irc.freenode.net
export PORT=6667
export PERMISSIONS_HOST=http://localhost:3000
export LINGUA_HOST=http://localhost:2000/
node index.js
