rabarber
========



Installation
------------
### Install owfs
As described in .https://gist.github.com/kmpm/4445289

    sudo apt-get install i2c-tools owfs ow-shell

Edit /etc/modprobe.d/raspi-blacklist.conf and
comment out the bcm2708 line.

    #blacklist i2c-bcm2708

Add __i2c-dev__ to the end of __/etc/modules__ file if it's not already listed.

Load the modules manually instead of restarting.
```bash
sudo modprobe i2c-bcm2708
sudo modprobe i2c-dev
```

Edit /etc/owfs.conf and remove any othter _server: FAKE..._ or whatever is default.
Instead add a line with for i2c like below.
```
#server: FAKE = DS18S20,DS2405

server: i2c = ALL:ALL

``` 
Restart service so it gets the new config

    sudo service owserver restart

### Install Node
Install node and setup a path

    cd /tmp
    wget http://nodejs.org/dist/v0.10.28/node-v0.10.28-linux-arm-pi.tar.gz
    cd /opt
    sudo tar -zxf /tmp/node-v0.10.28-linux-arm-pi.tar.gz
    sudo mv node-v0.10.28-linux-arm-pi node
    export PATH=$PATH:/opt/node/bin


### Install rabarber
Checkout rabarber code and install dependencies

    cd ~
    git clone https://github.com/kmpm/rabarber.git
    cd rabarber
    npm install --production


### Misc
Fix so that user for node process can reboot and poweroff

__/etc/sudoers.d/power__
```
<username> ALL=(ALL) NOPASSWD: /sbin/reboot
<username> ALL=(ALL) NOPASSWD: /sbin/poweroff
```