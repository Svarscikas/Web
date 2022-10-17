$(document).ready(function(){
    $('.delete-coin').on('click', function(e){
        $target = $(e.target);
        const id = ($target.attr('data-id'));
        $.ajax({
            type:'DELETE',
            url:'/coins/' + id,
            success: function(response){
                alert("Deleted coin");
                window.location.href = '/coins';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});