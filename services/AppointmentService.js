var appointment = require("../models/Appointment");
var mongoose = require("mongoose");
var AppointmentFactory = require("../factories/AppointmentFactory");
var dotenv = require("dotenv");
dotenv.config();
var mailer = require("nodemailer");

const Appo = mongoose.model("Appointment",appointment);

class AppointmentService {
  
    async Create(name,email,description,cpf,date,time){
        var newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished:false,
            notified:false
        });
        try {
            await newAppo.save();
            return true;
        } catch(e) {
            console.log(e);
            return false;

        }
      
    }

    async GetAll(showFinished)  {
     if(showFinished) {
        return await Appo.find();
     } else {
        var appos = await Appo.find({'finished':false});

        var appointments = [];

        appos.forEach(appointment => {
         if(appointment.date != undefined) {
            appointments.push(AppointmentFactory.Build(appointment));
         }
         
        });

        return appointments;
     }
    }

    async GetById(id) {
        try {
            var event = await Appo.findOne({'_id':id});
            return event;
        }
        catch(e) {
         console.log(e);
        }
        
    }

    async Finish(id) {
        try {
            Appo.findByIdAndUpdate(id,{finished:true});
            return true;
        } catch(e) {
            console.log(e);
          return false;
        }
      

    }

    async Search(query){
        try {
            var appos = await Appo.find().or([{email:query},{cpf:query}]);
            return appos;
        } catch(e) {
            console.log(e);
            return [];

        }
        
    }

    getTransporter() {
        var transporter = mailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth: {
              user:process.env.EMAIL_USER,
              pass:process.env.EMAIL_PASSWORD
            }
          })
        return transporter;  
    }


    async SendNotification() {
        var transporter = this.getTransporter();
       var appos =  await this.GetAll(false);
       appos.forEach(async app => {

         var date = app.start.getTime();
         var hour = 1000 * 60 * 60;
         var gap = date-Date.now();

         if(gap <= hour) {
           
            if(!app.notified) {
              await Appo.findByIdAndUpdate(app.id,{notified:true})
             transporter.sendMail({
                from:"Felipe Matheus <felipe@guia.com.br>",
                to:app.email,
                subject:"TESTE",
                text:"TESTANDO <h1>UHUL</h1>"
             }).then((msg) => {

             }).catch(e => {

             })

             


            }
         }


       })
    }

}

module.exports = new AppointmentService();