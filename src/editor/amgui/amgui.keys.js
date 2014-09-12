'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createKeyline: createKeyline,
        createKey: createKey
    }
};


function createKeyline(opt) {

    var deKeys = [];

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = (opt.height || 21) + 'px';
    de.style.background = opt.background || 'grey';
    de.style.position = 'relative';

    var svgEase = document.createElement('svg');
    svgEase.style.width = '100%';
    svgEase.style.height = '100%';
    svgEase.style.fill = 'none';
    svgEase.style.stroke = 'white';
    de.appendChild(svgEase);

    de.addKey = function (opt) {

        var deKey = amgui.createKey(opt);
        deKeys.push(deKey);

        de.appendChild(key);

        deKey.addEventListener('changeEase', renderEase);
        deKey.addEventListener('remove', onKeyRemove);
        renderEase();

        return key;
    }

     function onKeyRemove () {

        var idx = deKeys.indexOf(this);

        if (idx === -1) {
            return;
        }

        deKeys.splice(idx, 1);
        
        deKey.removeEventListener('changeEase', renderEase);
        deKey.removeEventListener('remove', onKeyRemove);

        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    function renderEase() {

        svgEase.innerHTML = '';

        deKeys.forEach(function (deKey, idx) {

            if (idx === deKeys.length-1) {
                return;
            }

            var rx = /cubic-bezier\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/,
                m = rx.exec(deKey.ease);

            if (!m) {
                return;
            }

            var x = deKey.offsetX,
                w = deKey.offsetWidth,
                h = de.offsetHeight,
                path = document.createElement('path'),
                d = '';

            d += 'M' + x + ',' + h + ' ';
            d += 'C' + (x + w*m[1]) + ',' + (h - h*m[2]) + ' ';
            d += (x + w*m[2]) + ',' + (h - h*m[3]) + ' ';
            d += (x + w) + ',0';

            path.d = d;
            svgEase.appendChild(path);
        });
    }

    return de;
}

function createKey(opt) {

    var isUserSelected = false, 
        mdx, mDragged,
        time = opt.time || 0, 
        timescale = opt.timescale || 1;

    var de = document.createElement('div');
    de.style.position = 'absolute';

    var key = document.createElement('div');
    key.style.width = '0';
    key.style.height = '0';
    key.style.borderStyle = 'solid';
    key.style.borderWidth = '21px 4px 0 4px';
    key.style.borderColor = '#7700ff transparent transparent transparent';
    de.appendChild(key);

    setLeft();
    de.setEase(opt.ease);

    amgui.makeDraggable({
        deTarget: de,
        onDown: function () {

            if (!e.shiftKey && !e.ctrlKey) {
                amgui.emit('deselectAllKeys');
            }

            if (e.ctrlKey) {
                toggleUserSelected();
            }
            else {
                userSelect(true);
            }
            
            return {
                dragged: 0;
            }
        },
        onMove: function (mx, my, md) {

            var diff = mx - md.mx,
                diffTime = (diff / timescale) - md.dragged;

            md.dragged += diffTime;

            amgui.emit('translateSelectedKeys', diffTime)
        }
    });

    amgui.on('deselectAllKeys', onDeselectAllKeys);
    amgui.on('translateSelectedKeys', onTranslateSelectedKeys);

    de.setTime = function(t) {

        if (time === t) return;

        time = t;
        setLeft();

        de.dispatchEvent(new CustomEvent('changeTime', {detail: {time: time}}));
    };
    de.setTimescale = function(ts) {

        if (timescale === ts) return;

        timescale = ts;
        setLeft();
    };

    de.setEase = function(ease) {

        if (de.ease === ease) {
            return;
        }

        de.ease = ease;

        de.dispatchEvent(new Event('changeEase'));
    };

    de.remove = function() {

        amgui.removeListener('deselectAllKeys', onDeselectAllKeys);
        amgui.removeListener('translateSelectedKeys', onTranslateSelectedKeys);

        de.dispatchEvent(new Event('remove'));
    }

    return de;

    ///////////////////////////////////////////////////////


    function setLeft() {

        de.style.left = ((time * timescale) - 4) + 'px';
    }

    function toggleUserSelected() {

        userSelect(!isUserSelected);
    }

    function userSelect(on) {

        isUserSelected = on;
        de.style.background = isUserSelected ? 'white' : 'none';
    }

    function onDeselectAllKeys() {

        userSelect(false);
    }

    function onTranslateSelectedKeys(offset) {

        if (isUserSelected) {

            de.setTime(time + offset);
        }
    }
}