package com.example.proyectomc.Jugador;

import java.util.Date;
import com.example.proyectomc.Equipo.Equipo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Jugador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String nombre;

    @Temporal(TemporalType.DATE)
    private Date fechaNacimiento;

    private int numeroCamiseta;

    private String posicion;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    @JsonIgnoreProperties("jugadores")
    private Equipo equipo;
}