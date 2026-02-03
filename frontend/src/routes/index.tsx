import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCoffee,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUsers,
  FiWifi,
} from "react-icons/fi"
import {
  GiHummingbird,
  GiMountainRoad,
  GiPalmTree,
  GiPoolDive,
} from "react-icons/gi"
import { Button } from "@/components/ui/button"
import Logo from "/assets/images/capri-logo.png"
import FaunaImg from "/assets/images/landing/Hotel-capri-dorada-faunal.jpg"
// Imágenes generales
import HeroImg from "/assets/images/landing/Hotel-capri-doradal.jpg"
import HotelImg2 from "/assets/images/landing/hoteles-doradal-antioquia.jpg"
import PoolImg from "/assets/images/landing/hoteles-doradal-antioquia-piscina1355.jpg"
import CongoImg from "/assets/images/landing/nuevas-atracciones-hacienda-napoles-congo-doradal-antioquia-scaled.jpg"
import RoomImg7 from "/assets/images/rooms/7-habitacion-familiar-Hotel-Capri-Doradal-sextuple-edit-1200x538.jpg"
import RoomImg6 from "/assets/images/rooms/edit-habitacion-familiar-Hotel-Capri-Doradal-1200x538.jpg"
// Imágenes de habitaciones - Alta resolución
import RoomImg1 from "/assets/images/rooms/IMG_3726-compressed-scaled.jpg"
import RoomImg2 from "/assets/images/rooms/IMG_3727-compressed-scaled.jpg"
import RoomImg3 from "/assets/images/rooms/IMG_3731-compressed-scaled.jpg"
import RoomImg4 from "/assets/images/rooms/IMG_3733-compressed-scaled.jpg"
import RoomImg5 from "/assets/images/rooms/IMG_7494-compressed-scaled.jpg"
import RoomImg8 from "/assets/images/rooms/vista-a-doradal.jpg"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

// Datos de habitaciones - Por ahora solo tenemos Habitación Doble Superior
const roomTypes = [
  {
    name: "Habitación Doble Superior",
    description:
      "Amplia habitación con cama extra grande, balcón privado con vista a Doradal y todas las comodidades para tu descanso.",
    price: 180000,
    capacity: 2,
    images: [
      RoomImg1,
      RoomImg2,
      RoomImg3,
      RoomImg4,
      RoomImg5,
      RoomImg6,
      RoomImg7,
      RoomImg8,
    ],
    features: [
      "Cama extra grande",
      "Balcón privado",
      "Baño privado",
      "Aire acondicionado",
      "Vista a Doradal",
      "WiFi gratis",
    ],
  },
]

// Amenidades
const amenities = [
  {
    icon: GiPoolDive,
    title: "Piscina",
    description: "Dos piscinas con zona de descanso y sombrillas",
  },
  {
    icon: GiPalmTree,
    title: "Naturaleza",
    description: "Rodeados de exuberante vegetación tropical",
  },
  {
    icon: GiHummingbird,
    title: "Fauna Silvestre",
    description: "Avistamiento de aves y animales de la región",
  },
  {
    icon: GiMountainRoad,
    title: "Hacienda Nápoles",
    description: "A solo 5 minutos del parque temático",
  },
  {
    icon: FiWifi,
    title: "WiFi Gratis",
    description: "Conexión de alta velocidad en todas las áreas",
  },
  {
    icon: FiCoffee,
    title: "Restaurante",
    description: "Desayuno incluido y menú del día disponible",
  },
]

// Galería
const galleryImages = [
  { src: HeroImg, alt: "Vista frontal del hotel" },
  { src: PoolImg, alt: "Piscina del hotel" },
  { src: FaunaImg, alt: "Fauna local - Tucán" },
  { src: HotelImg2, alt: "Áreas comunes" },
  { src: CongoImg, alt: "Cerca de Hacienda Nápoles" },
]

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentRoomImage, setCurrentRoomImage] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Box bg="white" minH="100vh" w="100%" overflowX="hidden">
      {/* Navbar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="whiteAlpha.900"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="blackAlpha.100"
      >
        <Container maxW="7xl" mx="auto">
          <Flex h="70px" align="center" justify="space-between">
            <Link to="/">
              <Flex align="center" gap={3}>
                <Image
                  src={Logo}
                  alt="Capri Doradal"
                  h="40px"
                  filter="invert(1)"
                />
                <Text
                  fontFamily="heading"
                  fontSize="xl"
                  fontWeight="600"
                  color="brand.700"
                  display={{ base: "none", md: "block" }}
                >
                  Capri Doradal
                </Text>
              </Flex>
            </Link>

            <HStack gap={4} display={{ base: "none", md: "flex" }}>
              <Link to="/">
                <Text
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "brand.500" }}
                >
                  Inicio
                </Text>
              </Link>
              <a href="#habitaciones">
                <Text
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "brand.500" }}
                >
                  Habitaciones
                </Text>
              </a>
              <a href="#amenidades">
                <Text
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "brand.500" }}
                >
                  Amenidades
                </Text>
              </a>
              <a href="#galeria">
                <Text
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "brand.500" }}
                >
                  Galería
                </Text>
              </a>
              <a href="#contacto">
                <Text
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "brand.500" }}
                >
                  Contacto
                </Text>
              </a>
            </HStack>

            <HStack gap={3}>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="solid" size="sm">
                  Reservar
                </Button>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box position="relative" h={{ base: "100vh", md: "90vh" }} minH="600px">
        <Box
          position="absolute"
          inset={0}
          backgroundImage={`url(${HeroImg})`}
          backgroundSize="cover"
          backgroundPosition="center"
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        <Container
          maxW="7xl"
          mx="auto"
          position="relative"
          zIndex={1}
          h="100%"
          pt="70px"
        >
          <Flex
            direction="column"
            justify="center"
            align="center"
            h="100%"
            textAlign="center"
            color="white"
            px={4}
          >
            <VStack gap={6} maxW="4xl" className="animate-fade-in-up">
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="500"
                letterSpacing="wider"
                textTransform="uppercase"
                opacity={0.9}
              >
                Bienvenido a
              </Text>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontFamily="heading"
                fontWeight="600"
                lineHeight="1.1"
                textShadow="2px 2px 4px rgba(0,0,0,0.3)"
              >
                Hotel Capri Doradal
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                maxW="2xl"
                opacity={0.95}
                lineHeight="1.7"
              >
                Tu refugio en el corazón del Magdalena Medio. Naturaleza,
                confort y experiencias inolvidables a solo minutos de la
                Hacienda Nápoles.
              </Text>

              {/* Botón de Reserva */}
              <Flex
                direction={{ base: "column", sm: "row" }}
                mt={8}
                gap={4}
                justify="center"
                align="center"
              >
                <Link to="/signup">
                  <Button
                    size="lg"
                    px={10}
                    py={7}
                    w={{ base: "100%", sm: "auto" }}
                    fontSize="lg"
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: "brand.600", transform: "translateY(-2px)" }}
                    boxShadow="xl"
                    transition="all 0.3s"
                  >
                    Reservar Ahora
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    px={8}
                    py={7}
                    w={{ base: "100%", sm: "auto" }}
                    fontSize="lg"
                    variant="outline"
                    borderColor="white"
                    borderWidth="2px"
                    color="white"
                    _hover={{
                      bg: "whiteAlpha.200",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.3s"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </Flex>
            </VStack>
          </Flex>
        </Container>

        {/* Indicadores de scroll */}
        <Box
          position="absolute"
          bottom={8}
          left="50%"
          transform="translateX(-50%)"
          className="animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          <Box
            w="30px"
            h="50px"
            border="2px solid white"
            borderRadius="full"
            position="relative"
            opacity={0.7}
          >
            <Box
              position="absolute"
              top="8px"
              left="50%"
              transform="translateX(-50%)"
              w="4px"
              h="8px"
              bg="white"
              borderRadius="full"
              animation="bounce 2s infinite"
            />
          </Box>
        </Box>
      </Box>

      {/* Amenidades Section */}
      <Box id="amenidades" py={20} bg="nature.sand">
        <Container maxW="7xl" mx="auto">
          <VStack gap={12}>
            <VStack gap={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="brand.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Lo que ofrecemos
              </Text>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontFamily="heading"
                fontWeight="600"
              >
                Amenidades y Servicios
              </Heading>
              <Text color="gray.600" maxW="2xl">
                Disfruta de todas las comodidades que tenemos para hacer de tu
                estadía una experiencia inolvidable.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={8} w="100%">
              {amenities.map((amenity, index) => (
                <Flex
                  key={amenity.title}
                  direction="column"
                  align="center"
                  textAlign="center"
                  p={8}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="sm"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-8px)",
                    boxShadow: "xl",
                  }}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Flex
                    w="70px"
                    h="70px"
                    borderRadius="2xl"
                    bg="brand.50"
                    align="center"
                    justify="center"
                    mb={4}
                  >
                    <Icon as={amenity.icon} boxSize={8} color="brand.500" />
                  </Flex>
                  <Heading size="md" fontFamily="heading" mb={2}>
                    {amenity.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {amenity.description}
                  </Text>
                </Flex>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Habitaciones Section */}
      <Box id="habitaciones" py={20}>
        <Container maxW="7xl" mx="auto">
          <VStack gap={12}>
            <VStack gap={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="brand.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Alojamiento
              </Text>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontFamily="heading"
                fontWeight="600"
              >
                Nuestras Habitaciones
              </Heading>
              <Text color="gray.600" maxW="2xl">
                Disfruta de nuestras cómodas habitaciones. Todas incluyen
                desayuno y acceso a las áreas comunes.
              </Text>
            </VStack>

            {/* Habitación Doble Superior - Diseño destacado */}
            {roomTypes.map((room) => (
              <Grid
                key={room.name}
                templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }}
                gap={8}
                w="100%"
                bg="white"
                borderRadius="3xl"
                overflow="hidden"
                boxShadow="xl"
                border="1px solid"
                borderColor="gray.100"
              >
                {/* Galería de imágenes */}
                <Box position="relative">
                  <Box
                    position="relative"
                    h={{ base: "350px", md: "500px", lg: "550px" }}
                    overflow="hidden"
                    bg="gray.900"
                  >
                    <Image
                      src={room.images[currentRoomImage]}
                      alt={`${room.name} - Imagen ${currentRoomImage + 1}`}
                      w="100%"
                      h="100%"
                      objectFit="contain"
                      objectPosition="center"
                      transition="all 0.4s ease-in-out"
                      loading="eager"
                      _hover={{ transform: "scale(1.02)" }}
                    />

                    {/* Controles del carrusel */}
                    <Flex
                      position="absolute"
                      inset={0}
                      justify="space-between"
                      align="center"
                      px={4}
                      pointerEvents="none"
                    >
                      <Button
                        onClick={() =>
                          setCurrentRoomImage(
                            (prev) =>
                              (prev - 1 + room.images.length) %
                              room.images.length,
                          )
                        }
                        bg="white"
                        color="brand.600"
                        borderRadius="full"
                        w="50px"
                        h="50px"
                        p={0}
                        boxShadow="xl"
                        pointerEvents="auto"
                        _hover={{
                          bg: "brand.500",
                          color: "white",
                          transform: "scale(1.1)",
                        }}
                        transition="all 0.2s"
                      >
                        <Icon as={FiChevronLeft} boxSize={6} />
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentRoomImage(
                            (prev) => (prev + 1) % room.images.length,
                          )
                        }
                        bg="white"
                        color="brand.600"
                        borderRadius="full"
                        w="50px"
                        h="50px"
                        p={0}
                        boxShadow="xl"
                        pointerEvents="auto"
                        _hover={{
                          bg: "brand.500",
                          color: "white",
                          transform: "scale(1.1)",
                        }}
                        transition="all 0.2s"
                      >
                        <Icon as={FiChevronRight} boxSize={6} />
                      </Button>
                    </Flex>

                    {/* Badge de capacidad */}
                    <Flex
                      position="absolute"
                      top={4}
                      right={4}
                      bg="brand.500"
                      px={4}
                      py={2}
                      borderRadius="full"
                      align="center"
                      gap={2}
                    >
                      <Icon as={FiUsers} boxSize={4} color="white" />
                      <Text fontSize="sm" fontWeight="600" color="white">
                        {room.capacity} personas
                      </Text>
                    </Flex>

                    {/* Indicador de imagen */}
                    <Flex
                      position="absolute"
                      bottom={4}
                      left="50%"
                      transform="translateX(-50%)"
                      bg="blackAlpha.600"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      <Text fontSize="xs" color="white" fontWeight="500">
                        {currentRoomImage + 1} / {room.images.length}
                      </Text>
                    </Flex>
                  </Box>

                  {/* Thumbnails */}
                  <Flex
                    gap={3}
                    p={4}
                    bg="gray.100"
                    overflowX="auto"
                    css={{
                      "&::-webkit-scrollbar": { height: "6px" },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#CBD5E0",
                        borderRadius: "3px",
                      },
                    }}
                  >
                    {room.images.map((img, index) => (
                      <Box
                        key={index}
                        minW="90px"
                        w="90px"
                        h="65px"
                        borderRadius="xl"
                        overflow="hidden"
                        cursor="pointer"
                        opacity={currentRoomImage === index ? 1 : 0.5}
                        border={
                          currentRoomImage === index ? "3px solid" : "2px solid"
                        }
                        borderColor={
                          currentRoomImage === index
                            ? "brand.500"
                            : "transparent"
                        }
                        transition="all 0.3s ease"
                        transform={
                          currentRoomImage === index
                            ? "scale(1.05)"
                            : "scale(1)"
                        }
                        boxShadow={currentRoomImage === index ? "lg" : "sm"}
                        _hover={{ opacity: 1, transform: "scale(1.05)" }}
                        onClick={() => setCurrentRoomImage(index)}
                        flexShrink={0}
                      >
                        <Image
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>

                {/* Información de la habitación */}
                <VStack
                  p={{ base: 6, md: 10 }}
                  align="center"
                  textAlign="center"
                  justify="center"
                  gap={6}
                >
                  <VStack align="center" gap={2}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="brand.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Disponible
                    </Text>
                    <Heading
                      fontSize={{ base: "2xl", md: "3xl" }}
                      fontFamily="heading"
                      fontWeight="600"
                    >
                      {room.name}
                    </Heading>
                  </VStack>

                  <Text color="gray.600" lineHeight="1.8" fontSize="md">
                    {room.description}
                  </Text>

                  {/* Características */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} w="100%">
                    {room.features.map((feature) => (
                      <Flex
                        key={feature}
                        align="center"
                        gap={2}
                        justify="center"
                      >
                        <Flex
                          w="24px"
                          h="24px"
                          borderRadius="full"
                          bg="brand.50"
                          align="center"
                          justify="center"
                          flexShrink={0}
                        >
                          <Icon as={FiCheck} boxSize={3} color="brand.500" />
                        </Flex>
                        <Text fontSize="sm" color="gray.700">
                          {feature}
                        </Text>
                      </Flex>
                    ))}
                  </SimpleGrid>

                  {/* Precio y CTA */}
                  <Box
                    w="100%"
                    pt={4}
                    borderTop="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      justify="space-between"
                      align="center"
                      w="100%"
                      gap={4}
                    >
                      <VStack align="center" gap={0}>
                        <Text fontSize="sm" color="gray.500">
                          Desde
                        </Text>
                        <HStack align="baseline" gap={1}>
                          <Text
                            fontSize="3xl"
                            fontWeight="700"
                            color="brand.600"
                          >
                            {formatPrice(room.price)}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            /noche
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          Desayuno incluido
                        </Text>
                      </VStack>
                      <Link to="/signup">
                        <Button
                          size="lg"
                          px={8}
                          w={{ base: "100%", sm: "auto" }}
                        >
                          Reservar
                        </Button>
                      </Link>
                    </Flex>
                  </Box>
                </VStack>
              </Grid>
            ))}
          </VStack>
        </Container>
      </Box>

      {/* Galería Section */}
      <Box id="galeria" py={20} bg="gray.900">
        <Container maxW="7xl" mx="auto">
          <VStack gap={12}>
            <VStack gap={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="brand.400"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Explora
              </Text>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontFamily="heading"
                fontWeight="600"
                color="white"
              >
                Galería de Fotos
              </Heading>
            </VStack>

            {/* Carrusel */}
            <Box position="relative" w="100%" maxW="5xl">
              <Box
                position="relative"
                h={{ base: "300px", md: "500px" }}
                borderRadius="2xl"
                overflow="hidden"
              >
                <Image
                  src={galleryImages[currentSlide].src}
                  alt={galleryImages[currentSlide].alt}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  transition="opacity 0.5s"
                />

                {/* Controles */}
                <Flex
                  position="absolute"
                  inset={0}
                  justify="space-between"
                  align="center"
                  px={4}
                >
                  <Button
                    onClick={prevSlide}
                    bg="whiteAlpha.800"
                    color="gray.800"
                    borderRadius="full"
                    w="50px"
                    h="50px"
                    p={0}
                    _hover={{ bg: "white" }}
                  >
                    <Icon as={FiChevronLeft} boxSize={6} />
                  </Button>
                  <Button
                    onClick={nextSlide}
                    bg="whiteAlpha.800"
                    color="gray.800"
                    borderRadius="full"
                    w="50px"
                    h="50px"
                    p={0}
                    _hover={{ bg: "white" }}
                  >
                    <Icon as={FiChevronRight} boxSize={6} />
                  </Button>
                </Flex>

                {/* Caption */}
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  p={6}
                  bg="linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
                >
                  <Text color="white" fontWeight="500">
                    {galleryImages[currentSlide].alt}
                  </Text>
                </Box>
              </Box>

              {/* Indicadores */}
              <Flex justify="center" gap={2} mt={4}>
                {galleryImages.map((_, index) => (
                  <Box
                    key={index}
                    w={currentSlide === index ? "24px" : "8px"}
                    h="8px"
                    borderRadius="full"
                    bg={currentSlide === index ? "brand.400" : "whiteAlpha.400"}
                    cursor="pointer"
                    transition="all 0.3s"
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </Flex>
            </Box>

            {/* Thumbnails */}
            <Flex gap={4} overflowX="auto" pb={2} w="100%" justify="center">
              {galleryImages.map((img, index) => (
                <Box
                  key={index}
                  w="100px"
                  h="70px"
                  borderRadius="lg"
                  overflow="hidden"
                  cursor="pointer"
                  opacity={currentSlide === index ? 1 : 0.5}
                  border={currentSlide === index ? "2px solid" : "none"}
                  borderColor="brand.400"
                  transition="all 0.3s"
                  onClick={() => setCurrentSlide(index)}
                  flexShrink={0}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Ubicación Section */}
      <Box py={20} bg="nature.sand">
        <Container maxW="7xl" mx="auto">
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={12}
            alignItems="center"
          >
            <VStack align="center" textAlign="center" gap={6}>
              <VStack align="center" gap={2}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="brand.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Ubicación
                </Text>
                <Heading
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontFamily="heading"
                  fontWeight="600"
                >
                  ¿Cómo Llegar?
                </Heading>
              </VStack>

              <Text color="gray.600" lineHeight="1.8">
                Estamos ubicados en Doradal, Antioquia, en el corazón del
                Magdalena Medio. A solo 5 minutos de la famosa Hacienda Nápoles
                y sus parques temáticos, incluyendo el nuevo parque de
                atracciones Congo.
              </Text>

              <VStack align="center" gap={4} w="100%">
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  align="center"
                  gap={4}
                >
                  <Flex
                    w="50px"
                    h="50px"
                    borderRadius="xl"
                    bg="brand.500"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={FiMapPin} boxSize={5} color="white" />
                  </Flex>
                  <VStack align="center" gap={0}>
                    <Text fontWeight="600">Dirección</Text>
                    <Text color="gray.600" fontSize="sm">
                      Doradal, Puerto Triunfo, Antioquia, Colombia
                    </Text>
                  </VStack>
                </Flex>

                <Flex
                  direction={{ base: "column", sm: "row" }}
                  align="center"
                  gap={4}
                >
                  <Flex
                    w="50px"
                    h="50px"
                    borderRadius="xl"
                    bg="brand.500"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={GiMountainRoad} boxSize={5} color="white" />
                  </Flex>
                  <VStack align="center" gap={0}>
                    <Text fontWeight="600">Desde Medellín</Text>
                    <Text color="gray.600" fontSize="sm">
                      3 horas por la Autopista Medellín-Bogotá
                    </Text>
                  </VStack>
                </Flex>

                <Flex
                  direction={{ base: "column", sm: "row" }}
                  align="center"
                  gap={4}
                >
                  <Flex
                    w="50px"
                    h="50px"
                    borderRadius="xl"
                    bg="brand.500"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={FiStar} boxSize={5} color="white" />
                  </Flex>
                  <VStack align="center" gap={0}>
                    <Text fontWeight="600">Cerca de</Text>
                    <Text color="gray.600" fontSize="sm">
                      Hacienda Nápoles, Parque Congo, Río Claro
                    </Text>
                  </VStack>
                </Flex>
              </VStack>
            </VStack>

            {/* Mapa placeholder */}
            <Box h="400px" borderRadius="2xl" overflow="hidden" boxShadow="xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.36834575916!2d-74.770318!3d5.9000847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4147ba95fb10eb%3A0xae975307e36c488!2sHotel%20Capri%20Doradal!5e0!3m2!1ses!2sco!4v1706915600000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hotel Capri Doradal"
              />
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          backgroundImage={`url(${CongoImg})`}
          backgroundSize="cover"
          backgroundPosition="center"
          _after={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: "linear-gradient(135deg, rgba(26, 95, 74, 0.9) 0%, rgba(13, 61, 46, 0.95) 100%)",
          }}
        />

        <Container maxW="4xl" mx="auto" position="relative" zIndex={1}>
          <VStack gap={8} textAlign="center" color="white">
            <Heading
              fontSize={{ base: "3xl", md: "5xl" }}
              fontFamily="heading"
              fontWeight="600"
            >
              ¿Listo para tu próxima aventura?
            </Heading>
            <Text fontSize="lg" maxW="2xl" opacity={0.9}>
              Reserva ahora y vive la experiencia Capri Doradal. Naturaleza,
              confort y la mejor ubicación para explorar el Magdalena Medio.
            </Text>
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={4}
              align="center"
              justify="center"
            >
              <Link to="/signup">
                <Button
                  size="lg"
                  bg="white"
                  color="brand.600"
                  _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                  px={8}
                >
                  Reservar Ahora
                </Button>
              </Link>
              <a
                href="https://wa.me/573006864784"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  px={8}
                >
                  WhatsApp
                </Button>
              </a>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box id="contacto" bg="gray.900" color="white" py={16}>
        <Container maxW="7xl" mx="auto">
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }}
            gap={12}
          >
            {/* Logo y descripción */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              textAlign={{ base: "center", md: "left" }}
              gap={4}
            >
              <Flex align="center" gap={3}>
                <Image
                  src={Logo}
                  alt="Capri Doradal"
                  h="50px"
                  filter="brightness(0) invert(1)"
                />
                <Text fontFamily="heading" fontSize="xl" fontWeight="600">
                  Capri Doradal
                </Text>
              </Flex>
              <Text color="gray.400" fontSize="sm" lineHeight="1.8">
                Tu refugio en el corazón del Magdalena Medio. Disfruta de la
                naturaleza, el confort y experiencias inolvidables en Doradal,
                Antioquia.
              </Text>
              <HStack gap={3} pt={2}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="lg"
                    bg="whiteAlpha.100"
                    align="center"
                    justify="center"
                    _hover={{ bg: "brand.500" }}
                    transition="all 0.3s"
                  >
                    <Icon as={FiInstagram} boxSize={5} />
                  </Flex>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="lg"
                    bg="whiteAlpha.100"
                    align="center"
                    justify="center"
                    _hover={{ bg: "brand.500" }}
                    transition="all 0.3s"
                  >
                    <Icon as={FiFacebook} boxSize={5} />
                  </Flex>
                </a>
              </HStack>
            </VStack>

            {/* Enlaces rápidos */}
            <VStack align={{ base: "center", md: "flex-start" }} gap={3}>
              <Text fontWeight="600" mb={2}>
                Enlaces
              </Text>
              <a href="#habitaciones">
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                >
                  Habitaciones
                </Text>
              </a>
              <a href="#amenidades">
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                >
                  Amenidades
                </Text>
              </a>
              <a href="#galeria">
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                >
                  Galería
                </Text>
              </a>
              <Link to="/login">
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                >
                  Iniciar Sesión
                </Text>
              </Link>
            </VStack>

            {/* Contacto */}
            <VStack align={{ base: "center", md: "flex-start" }} gap={3}>
              <Text fontWeight="600" mb={2}>
                Contacto
              </Text>
              <Flex align="center" gap={2}>
                <Icon as={FiPhone} color="brand.400" />
                <Text color="gray.400" fontSize="sm">
                  +57 3006864784
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Icon as={FiMail} color="brand.400" />
                <Text color="gray.400" fontSize="sm">
                  info@capridoradal.com
                </Text>
              </Flex>
              <Flex
                align={{ base: "center", md: "flex-start" }}
                direction={{ base: "column", md: "row" }}
                gap={2}
              >
                <Icon as={FiMapPin} color="brand.400" mt={{ base: 0, md: 1 }} />
                <Text
                  color="gray.400"
                  fontSize="sm"
                  textAlign={{ base: "center", md: "left" }}
                >
                  Doradal, Puerto Triunfo,
                  <br />
                  Antioquia, Colombia
                </Text>
              </Flex>
            </VStack>

            {/* Horarios */}
            <VStack align={{ base: "center", md: "flex-start" }} gap={3}>
              <Text fontWeight="600" mb={2}>
                Horarios
              </Text>
              <Text color="gray.400" fontSize="sm">
                <strong>Check-in:</strong> 3:00 PM
              </Text>
              <Text color="gray.400" fontSize="sm">
                <strong>Check-out:</strong> 12:00 PM
              </Text>
              <Text color="gray.400" fontSize="sm">
                <strong>Recepción:</strong> 24 horas
              </Text>
            </VStack>
          </Grid>

          {/* Copyright */}
          <Box
            mt={12}
            pt={8}
            borderTop="1px solid"
            borderColor="whiteAlpha.100"
            textAlign="center"
          >
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} Hotel Capri Doradal. Todos los
              derechos reservados.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
