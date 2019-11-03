apple.directive('tbSizer', function() {
    return {
        restrict: 'A',
        link: function() {
            pressed=false;
            bord=false;
            start = $(this);
            $("table th").hover(function(e){
                if(e.offsetX<=0){
                    bord=true;
                    start = $(this);
                    startX = e.pageX;
                    startWidth = $(this).width();
                    $(start).addClass("resizing");
                }
                else if (!pressed){
                    bord=false;
                    $(start).removeClass("resizing");
                }
            });
            $("table th").mousedown(function(e) {
                if(bord){
                    pressed = true;
                }
            });
            $(document).mousemove(function(e) {
                if(pressed) {
                    $(start).width(startWidth+(startX-e.pageX));
                }
            });
            $(document).mouseup(function() {
                if(pressed) {
                    $(start).removeClass("resizing");
                    pressed = false;
                }
                else{
                    $(start).removeClass("resizing");
                }
            });
        }
    }
});