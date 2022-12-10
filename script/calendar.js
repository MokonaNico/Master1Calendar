!async function(){
    fetch_events().then((events_fetch)=> {
        let events = []
        for (let [key,value] of Object.entries(localStorage) ){
            if(value !== ""){
                localStorage.removeItem(key)
            }

            let spliced = key.split('_')
            let cursus = spliced[0]
            let course = spliced[1]
            let option = cursus.split(' ')[1];

            // If the key in the local storage begin with only BAB1,BAB2,BAB3 or MASTER
            // Then it's an old key when there was only INFO, so we can just add INFO in front of the cursus
            if(["BAB1","BAB2","BAB3","MASTER"].includes(cursus)){
                localStorage.removeItem(key)
                localStorage.setItem(cursus+" INFO_"+course,"")
                cursus=cursus+" INFO"
                option = "INFO"
            }

            let course_events = events_fetch[option][cursus][course];

            course_events.forEach((event)=>{
                let date = new Date(event.start)
                let start = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(),date.getMinutes()]
                date = new Date(event.end)
                let end = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(),date.getMinutes()]

                let title = event.title

                let ics_event = {
                    title,
                    start,
                    end,
                }
                ics_events.push(ics_event)

                event.title = event.title.replaceAll("\n","\n\n");
            });
            events = events.concat(course_events)
        }

        calendar(events);

    }).catch(error => {
        console.error(error);
    });


}();

function calendar(events) {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'fr',
        initialView: 'timeGridWeek',
        slotMinTime:"08:00:00",
        slotMaxTime:"21:00:00",
        slotEventOverlap:false,
        expandRows: true,
        allDaySlot:false,
        nowIndicator:true,
        firstDay: 1,
        handleWindowResize: true,
        defaultAllDay: false,
        displayEventEnd: true,
        events: events,
        eventDisplay: 'block',
        height: 'auto',
        titleFormat: {
            month: 'long',
            year: 'numeric'
        },
        customButtons: {
            select: {
                theme: 'true',
                text: 'Sélection des cours',
                click:() => {
                    location.href = "config.html";
                }
            },
            ics: {
                theme: 'true',
                text: 'ICS',
                click: () => download_ics(),
            },
        },
        headerToolbar: {
            start: 'select ics',
            center: 'title',
            end: 'today prev,next timeGridWeek,dayGridMonth',
        },
        fixedWeekCount: false,
        eventDidMount: function(info) {
          var tooltip = new Tooltip(info.el, {
            title: info.event.title.replaceAll("\n\n","<br/><br/>"),
            placement: 'top',
            trigger: 'hover',   
            container: 'body',
            html: true
          });
        },
    });
    calendar.render();
}
