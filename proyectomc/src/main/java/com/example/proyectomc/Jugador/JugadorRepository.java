package com.example.proyectomc.Jugador;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface JugadorRepository extends JpaRepository<Jugador, Integer> {
    @Query("SELECT j FROM Jugador j ORDER BY j.equipo.nombre ASC, j.id ASC")
    List<Jugador> findAllOrderByEquipo();
}