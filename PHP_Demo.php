<!--PHP and HTML are tightly coupled. The only difference is we can write php code in the HTML in a .php file.-->

<!--Run the server with:
    Start php server - php -S localhost:9000
    Open browser and enter - http://localhost:9000/file-name.php
-->
<html>
    <head>
        <meta charset="utf-8">
    </head>

    <body>
        <form action="PHP_Demo.php" method="post">
            Event: <input type="text" name="event">
            Price: <input type="text" name="price">
            <input type="submit">
        </form>

        <?php
            $name = "John Smith";
            $age = 23;

            // Basics
            echo("PHP Demo!<h1>Hello $name.</h1>You are $age years old.");
            $age += 1;
            echo "<br>Next year you will be $age.<br>";

            // String
            echo "<br>String length is " . strlen($name);
            echo "<br>String to upper " . strtoupper($name);
            echo "<br>String to lower " . strtolower($name);
            echo "<br>String's 3rd char is $name[2] is replaced with " . $name[2] = 'B';
            echo "<br>New string is $name";
            echo "<br>String Replace replaces more than 1 char. $name: " . str_replace("Smith", "Modi", $name);
            echo "<br>Sub String makes another string from the existing string: " . substr($name, 0, 4) . "<br>";

            // Integer
            echo "<br>Absolute value of -100: " . abs(-100);
            echo "<br>Round value of 22.25: " . round(22.50);
            echo "<br>Power of 2 raised to 4 is: " . pow(2, 4);
            echo "<br>Root of 144 is: " . sqrt(144);
            echo "<br>Max & min value between 20 and 30: " . max(20,30) . " " .  min(20,30);
            echo "<br>Root of 144 is: " . sqrt(144);
            echo "<br>Root of 144 is: " . sqrt(144) . "<br>";

            // Get Input from user
            // We can use $_GET["event"] if the method in the above form in get. However, get is not preferable as it displays whatever we submit in the url which makes it less secure than post.
            echo "<br>The " . $_POST["event"] . " is for $" . $_POST["price"];
        ?>
    </body>
</html>

<style>
    h1 {
        color: darkblue;
    }
</style>
