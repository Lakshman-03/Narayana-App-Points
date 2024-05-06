const search = document.querySelector('.input-group input'),
   
table_headings = document.querySelectorAll('thead th'),

 table_rows = document.querySelectorAll('tbody tr');

search.addEventListener('input', searchTable);

function searchTable() {
    const arr = search.value.toLowerCase().split(" ");
    arr.forEach((val)=>{
        table_rows.forEach((row, i) => {
            let table_data = row.textContent.toLowerCase(),
                search_data = val.toLowerCase();
    
            row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
            row.style.setProperty('--delay', i / 25 + 's');
        })
    })
    
   
    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}

function selected() {
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = !checkbox.checked;

        const miniSelect = document.querySelector('.mini-select');
        miniSelect.style.visibility = miniSelect.style.visibility === 'visible' ? 'hidden' : 'visible';

    });

}


document.getElementById('threeDotBtn').addEventListener('click', toggleSetVisibility);

function toggleSetVisibility() {
    const set = document.querySelector('.set');
    set.style.opacity = (set.style.opacity === '1') ? '0' : '1';
}
var modal = document.getElementById("myModal");

var btns = document.querySelectorAll('.viewbtn');

var span = document.getElementsByClassName("close")[0];

btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        modal.style.display = "block";
    });
});

span.onclick = function() {
    modal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};